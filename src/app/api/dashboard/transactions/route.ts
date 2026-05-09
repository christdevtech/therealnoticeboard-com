import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(req: Request) {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()

  const { user } = await payload.auth({ headers: headersList })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const status = searchParams.get('status') // 'pending', 'completed', etc.

  try {
    const whereConditions: any = {
      or: [
        { buyer: { equals: user.id } },
        { seller: { equals: user.id } },
      ],
    }

    if (status) {
      whereConditions.status = { equals: status }
    }

    const transactions = await payload.find({
      collection: 'transactions',
      where: whereConditions,
      page,
      limit,
      sort: '-createdAt',
      depth: 1,
    })

    return NextResponse.json({
      transactions: transactions.docs,
      totalDocs: transactions.totalDocs,
      totalPages: transactions.totalPages,
      page: transactions.page,
    })
  } catch (error) {
    console.error('Error fetching dashboard transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()

  const { user } = await payload.auth({ headers: headersList })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    const transaction = await payload.create({
      collection: 'transactions',
      data: {
        ...body,
        buyer: user.id,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 400 },
    )
  }
}

export async function PATCH(req: Request) {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()

  const { user } = await payload.auth({ headers: headersList })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { transactionId, ...updateData } = body

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    // Verify user is involved in the transaction
    const transaction = await payload.findByID({
      collection: 'transactions',
      id: transactionId,
      depth: 0,
    })

    const buyerId = typeof transaction.buyer === 'object' ? transaction.buyer.id : transaction.buyer
    const sellerId =
      typeof transaction.seller === 'object' ? transaction.seller.id : transaction.seller

    if (buyerId !== user.id && sellerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Only allow confirming the relevant party's side
    const allowedUpdates: any = {}
    if (buyerId === user.id && updateData.buyerConfirmed !== undefined) {
      allowedUpdates.buyerConfirmed = updateData.buyerConfirmed
    }
    if (sellerId === user.id && updateData.sellerConfirmed !== undefined) {
      allowedUpdates.sellerConfirmed = updateData.sellerConfirmed
    }
    if (user.role === 'admin') {
      Object.assign(allowedUpdates, updateData)
    }

    const updated = await payload.update({
      collection: 'transactions',
      id: transactionId,
      data: allowedUpdates,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update transaction' },
      { status: 400 },
    )
  }
}
