import axios from "axios";
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

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: config.timeout,
      validateStatus: (status) => true,

      headers: {
        "User-Agent": config.userAgent,
      },
    });

    const contentLength = response.headers["content-length"];
    if (contentLength && Number(contentLength) > config.maxImageSize) {
      return {
        ...defaultResponse,
        status: 400,
        body: "Image size is too large.",
      };
    }

    const buffer = Buffer.from(response.data);

    const contentType = response.headers["content-type"];

    // shh compiler
    if (typeof contentType !== "string") {
      return {
        ...defaultResponse,
        status: 400,
        body: "Invalid content type received.",
      };
    }

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
    if (err.code === "ECONNABORTED") {
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
