import axios from "axios";
import { config } from "../Config";
import {
  Chapter,
  ChapterSrcs,
  Manga,
  SeriesIdentifier,
  getCacheKey,
} from "../manga/MangaTypes";

export default class CubariApi {
  public static async getManga(identifier: SeriesIdentifier) {
    let mangaGet = await axios.get(
      `${config.cubariUrl}/read/api/${encodeURIComponent(
        identifier.platform
      )}/series/${encodeURIComponent(identifier.series)}/`,
      {
        headers: {
          "User-Agent": config.userAgent
        }
      }
    );

    if (mangaGet.status !== 200) {
      throw new Error(`${mangaGet.status} - assuming the manga doesnt exist?`);
    }

    let manga: Manga = new Manga(await mangaGet.data, identifier.platform);

    return manga;
  }

  public static async getPages(manga: Manga, chapter: Chapter) {
    let pages: ChapterSrcs = await chapter.getImageSrcs(
      getCacheKey(manga.identifier, chapter.slug)
    );

    return pages;
  }

  public static getPageSrc(manga: Manga, pages: string[], page: number) {
    if (page - 1 > pages.length - 1 || page - 1 < 0) {
      throw Error("Invalid page. " + page);
    }

    let pageSrc: string = pages[page - 1];

    if (config.shouldProxyImages(manga.identifier.platform)) {
      pageSrc = `${config.proxyUrl}${encodeURIComponent(pageSrc)}`;
    }

    return pageSrc;
  }
}
