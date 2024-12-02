const config = {
    port: 3000 ,
    serverUrl: `${import.meta.env.SERVER_URL}` || 'http://localhost:3000',
    clientUrl: 'http://localhost:5173' || '',
    apiVersion: 'v1' || '',
}

export default config;