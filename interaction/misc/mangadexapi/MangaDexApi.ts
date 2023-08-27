import axios from "axios";
import { config } from "../../Config";
import { GetSearchMangaParamsSchema, LocalizedStringSchema, MangaListSchema, MangaSchema } from "./Schema";

// TODO: handle api limits (we arent hitting them rn so not my problem)

export interface MangaDexManga {
  id: string;
  title: string;
  description: string;
}

export interface SearchResults {
  data: MangaDexManga[];
  limit: number;
  offset: number;
  total: number;
}

// TODO: Put in config
const preferredLanguages = ["en"];

export default class MangaDexApi {
  public static async search(query: Partial<GetSearchMangaParamsSchema>): Promise<SearchResults> {
    const res = await axios.get(`${config.mangadexUrl}/manga`, {
      params: query,
    });

    const responseData: MangaListSchema = res.data;

    let searchResults: SearchResults = {
      data: responseData.data.map((manga: MangaSchema): MangaDexManga => {
        return {
          id: manga.id,
          title: MangaDexApi.getLocalizedString(manga.attributes.title),
          description: MangaDexApi.getLocalizedString(manga.attributes.description)
        };
      }),
      limit: responseData.limit,
      offset: responseData.offset,
      total: responseData.total
    };

    return searchResults;
  }

  private static getLocalizedString(data: LocalizedStringSchema): string {
    for (const lang of preferredLanguages) {
        if (data[lang]) return data[lang];
    }

    return Object.values(data)[0];
}
}
