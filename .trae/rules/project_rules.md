1. Always use pnpm as the package manager unless the situation or package specifically requires another package manager.
2. Always separate the client and server components, ensuring to maximize the use of local API for payload cms.
3. Avoid creating REST API endpoints that do the exact same thing as the payload cms inbuilt API endpoints for collections and globals.
4. If a REST API endpoint is required, it must be created in a way that is not disruptive to the payload cms inbuilt API endpoints.
5. When creating new routes or components, be sure to use the theme variables in the design of the UI of the pages and components so that the component will operate and look correctly in the various theme modes and the entire project's UI will be easily customizable.
6. When you are working in a client component and need an icon, first choice should be lucide-react icons and svgs if they do not have something suitable.
7. Whenever possible, use the types in the payload-types.ts file for the data you are working on so that if we make changes to the collection structure or block structure, the types will be automatically updated.
