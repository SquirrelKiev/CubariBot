import { config } from "./Config";

interface ProxyResult {
  status: number;
  body: string | Buffer;
  contentType: string;
}

export default async function proxy(url: string): Promise<ProxyResult> {
  const defaultResponse: ProxyResult = {
    status: 500,
    body: "",
    contentType: "text/plain",
  };

  if (!url) {
    return {
      ...defaultResponse,
      status: 400,
      body: "Please provide a URL in the query string.",
    };
  }

  const urlObj = new URL(url);
  if (!config.whitelistedDomains.includes(urlObj.hostname)) {
    return {
      ...defaultResponse,
      status: 403,
      body: "The domain in the URL is not whitelisted.",
    };
  }

  // for timeouts
  const controller = new AbortController();
  const signal = controller.signal;
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(url, { signal });

    clearTimeout(timeoutId);

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > config.maxImageSize) {
      return {
        ...defaultResponse,
        status: 400,
        body: "Image size is too large.",
      };
    }

    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image")) {
      return {
        ...defaultResponse,
        status: 400,
        body: "URL must point to an image.",
      };
    }

    return {
      status: 200,
      body: buffer,
      contentType: contentType,
    };
  } catch (err) {
    if (err.name === "AbortError") {
      return {
        ...defaultResponse,
        status: 408,
        body: "Request timed out.",
      };
    } else {
      return {
        ...defaultResponse,
        status: 500,
        body: "Error processing your request.",
      };
    }
  }
}
