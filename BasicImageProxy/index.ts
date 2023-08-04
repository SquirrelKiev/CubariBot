import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { config } from "./Config";
import { URL } from "url";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const url = req.query.url || (req.body && req.body.url);

  context.log(`Image proxy attempt started! url: ${url}`);

  // Check if a url was passed
  if (!url) {
    context.res = {
      status: 400,
      body: "Please provide a URL in the query string or in the request body.",
    };
    return;
  }

  // Check the domain is allowed
  const urlObj = new URL(url);
  if (!config.whitelistedDomains.includes(urlObj.hostname)) {
    context.res = {
      status: 403,
      body: "The domain in the URL is not allowed.",
    };
    return;
  }

  // Initialize AbortController to handle fetch timeouts
  const controller = new AbortController();
  const signal = controller.signal;
  const timeoutId = setTimeout(() => controller.abort(), config.timeout); // Set timeout to 5 seconds

  try {
    // Fetch the image from the URL
    const response = await fetch(url, { signal });

    // Clear timeout if the response is received within the time limit
    clearTimeout(timeoutId);

    // Check if the fetched resource is not too large
    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > config.maxImageSize) {
      context.res = {
        status: 400,
        body: "Image size is too large.",
      };
      return;
    }

    // Read the image as a Buffer
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Check if the content is actually an image
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith("image")) {
      context.res = {
        status: 400,
        body: "URL must point to an image.",
      };
      return;
    }

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: buffer,
      headers: {
        "Content-Type": contentType,
      },
      isRaw: true,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      context.res = {
        status: 408,
        body: "Request timed out.",
      };
    } else {
      context.res = {
        status: 500,
        body: "Error processing your request.",
      };
    }
  }
};

export default httpTrigger;
