import { SeriesIdentifier } from "./MangaTypes";

export interface NavigateState {
  interactionType: InteractionType;
  identifier: SeriesIdentifier;
  chapter: string;
  page: number;
}

export interface SearchState {
  interactionType: InteractionType;
  query: string;
  offset: number;
}

export enum InteractionType {
  None,
  Close,
  Manga_BackPage,
  Manga_ForwardPage,
  Manga_BackChapter,
  Manga_ForwardChapter,
  Manga_Open,
  Search_BackPage,
  Search_ForwardPage,
  Search_SelectManga,
}

export class InteractionIdSerializer {
  static encodeNavigate(info: NavigateState, uid: string): string {
    let customIdString = `${info.interactionType}|${info.identifier.platform}|${info.identifier.series}|${info.chapter}|${info.page}|${uid}`;

    if (customIdString.length > 100) {
      throw new Error("customIdString exceeds 100 characters");
    }

    return customIdString;
  }

  static decodeNavigate(customIdString: string): NavigateState {
    let data = customIdString.split("|");

    if (data.length !== 6) {
      throw new Error("Invalid customIdString format");
    }

    return {
      interactionType: parseInt(data[0]),
      identifier: {
        platform: data[1],
        series: data[2],
      },
      chapter: data[3],
      page: parseInt(data[4]),
    };
  }

  static encodeSelect(mangaId: string, uid: string): string {
    let customIdString = `${InteractionType.Search_SelectManga}|${mangaId}|${uid}`;

    if (customIdString.length > 100) {
      throw new Error("customIdString exceeds 100 characters");
    }

    return customIdString;
  }

  static decodeSelect(customIdString: string): string {
    let data = customIdString.split("|");

    if (data.length !== 3) {
      throw new Error("Invalid customIdString format");
    }

    return data[1];
  }

  static getInteractionType(customIdString: string): InteractionType {
    let data = customIdString.split("|");

    let interactionType: InteractionType = parseInt(data[0]);

    return interactionType;
  }
}
