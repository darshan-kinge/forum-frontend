const config = {
    port: 3000,
    serverUrl: 'http://localhost:3000' || import.meta.env.SERVER_URL || 'https://forum-backend-6zul.onrender.com',
    apiVersion: import.meta.env.API_VERSION || 'v1',
}

export default config;