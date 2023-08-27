import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import proxy from "./proxy";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const response = await proxy(req.query.url);

  const responseMapped = {
    status: response.status,
    body: response.body,
    headers: {
      "Content-Type": response.contentType
    }
  }

  context.res = responseMapped;
};

export default httpTrigger;
