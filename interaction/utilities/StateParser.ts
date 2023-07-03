import { InteractionType } from "slash-create";
import { Manga } from "./Manga";

export interface NavigateState {
  platform: Required<string>;
  series: Required<string>;
  chapter: Required<string>;
  page: Required<number>;
  interactionType: Required<MangaInteractionType>;
}

export enum MangaInteractionType {
  None,
  Close,
  BackPage,
  ForwardPage,
  BackChapter,
  ForwardChapter,
}

export class StateParser {

  static encodeNavigate(info: NavigateState, uid: string): string {
    let customIdString = `${info.interactionType}|${info.platform}|${info.series}|${info.chapter}|${info.page}|${uid}`;

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
      platform: data[1],
      series: data[2],
      chapter: data[3],
      page: parseInt(data[4]),
    };
  }

  static getInteractionType(customIdString: string): MangaInteractionType {
    let data = customIdString.split("|");

    let interactionType: MangaInteractionType = parseInt(data[0]);

    return interactionType;
  }
}
