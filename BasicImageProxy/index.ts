import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const url = (req.query.url || (req.body && req.body.url));

    // Check if a url was passed
    if (!url) {
        context.res = {
            status: 400,
            body: "Please provide a URL in the query string or in the request body."
        };
        return;
    }
 
    try {
        // Fetch the image from the URL
        const response = await fetch(url);

        // Check if the fetched resource is an image
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image')) {
            context.res = {
                status: 400,
                body: "URL must point to an image."
            };
            return;
        }

        // Read the image as a Buffer
        const imageBuffer = await response.arrayBuffer();

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: Buffer.from(imageBuffer),
            headers: {
                'Content-Type': contentType
            },
            isRaw: true
        };

    } catch (error) {
        context.log(error);
        context.res = {
            status: 500,
            body: "Error processing your request."
        };
    }

};

export default httpTrigger;
