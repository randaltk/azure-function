const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const requestData = req.body; // Assuming the JSON data is in the request body

    // Azure Storage account connection string
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString || connectionString.trim() === '') {
        context.log.error('Azure Storage Connection String is not defined or empty.');
        context.res = {
            status: 500,
            body: JSON.stringify({ error: 'Azure Storage Connection String is not defined or empty.' })
        };
        return;
    }

    // Azure Blob Storage container name
    const containerName = process.env.BLOB_CONTAINER_NAME;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    try {
        // Log the entire received JSON to the console
        context.log('Received JSON:', requestData);

        // Upload JSON to Azure Blob Storage
        const blobName = `${Date.now()}_data.json`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(JSON.stringify(requestData), JSON.stringify(requestData).length);

        // Respond with a success message and the received JSON
        context.res = {
            status: 200,
            body: JSON.stringify({ status: 'Data received and stored successfully', receivedData: requestData })
        };
    } catch (error) {
        context.log.error('Error logging data to Azure Blob Storage:', error);
        context.res = {
            status: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
