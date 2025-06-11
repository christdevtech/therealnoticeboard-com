1. Always use pnpm as the package manager unless the situation or package specifically requires another package manager.
2. ALways separate the client and server components, ensuring to maximize the use of local API for payload cms.
3. Avoid creating REST API endpoints that do the exact same thing as the payload cms inbuilt API endpoints for collections and globals.
