import { URL } from "url";
import { SeriesIdentifier } from "./MangaTypes";

// base regex is courtesy of https://github.com/subject-f/cubarimoe/blob/develop/static_global/js/main.js
export function parseMangaUrl(url: string): SeriesIdentifier | undefined {
  let series: string | undefined;
  let platform: string | undefined;

  if (/imgur/.test(url)) {
    platform = "imgur";
    series = /(a\/|gallery\/)([A-Z0-9a-z]{5}[A-Z0-9a-z]*\b)/.exec(url)?.[2];
  } else if (/git\.io/.test(url)) {
    platform = "gist";
    series = /(git.io\/)(.*)/.exec(url)?.[2];
  } else if (/(raw|gist)\.githubusercontent/.test(url)) {
    platform = "gist";
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    const parsedUrl = new URL(url);
    const b64 = Buffer.from(
      `${parsedUrl.host.split(".")[0]}${parsedUrl.pathname}`
    ).toString("base64");
    series = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
  } else if (
    /^[0-9]{5}[0-9]?$/.test(url) ||
    (/nhentai/.test(url) && /\/\b[0-9]+\b/.test(url))
  ) {
    platform = "nhentai";
    series = /(\/?)(\b[0-9]+\b)/.exec(url)?.[2];
  } else if (/mangadex\.org\/title/.test(url)) {
    platform = "mangadex";
    series =
      /(\/?)([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/.exec(
        url
      )?.[2];
  } else if (/mangasee123\.com/.test(url) || /manga4life\.com/.test(url)) {
    platform = "mangasee";
    url = url.replace(/\/$/, "");
    if (url.includes("/manga/")) {
      series = url.split("/manga/").pop();
    }
  } else if (/reddit\.com/i.test(url)) {
    platform = "reddit";
    series =
      /reddit\.com\/(?:r|u(?:ser)?)\/(?:[a-z0-9_\-]+)\/comments\/([a-z0-9]+)/i.exec(
        url
      )?.[1];
    if (!series) {
      series = /reddit\.com\/gallery\/([a-z0-9]+)/i.exec(url)?.[1];
    }
  } else if (/imgchest\.com/.test(url)) {
    platform = "imgchest";
    series = /p\/(\w+)/i.exec(url)?.[1];
  } else if (/cubari\.moe\/read\/api/.test(url)) {
    platform = /(\/read\/api\/)([^/]+)(\/series\/)([^/]+)/.exec(url)?.[2];
    series = /(\/read\/api\/)([^/]+)(\/series\/)([^/]+)/.exec(url)?.[4];
  } else if (/cubari\.moe\/read/.test(url)) {
    platform = /(\/read\/)([^/]+)(\/)([^/]+)/.exec(url)?.[2];
    series = /(\/read\/)([^/]+)(\/)([^/]+)/.exec(url)?.[4];
  } else if (/^[a-z]+\/[^/]+$/i.test(url)) {
    const split = url.split("/");
    if (split.length === 2) {
      platform = split[0];
      series = split[1];
    }
  } else {
    return undefined;
  }

  return { platform, series: series };
}
