import {
  ButtonStyle,
  ComponentContext,
  ComponentType,
  MessageOptions,
} from "slash-create";
import {
  MangaInteractionType,
  NavigateState,
  MangaNavigationStateParser,
} from "./MangaNavigationStateParser";
import { ChapterState } from "./MangaTypes";
import CubariApi from "../misc/CubariApi";

export class MangaNavigationHandler {
  static async handleNavigationInteraction(ctx: ComponentContext) {
    let state: NavigateState = MangaNavigationStateParser.decodeNavigate(
      ctx.customID
    );

    ctx.editParent(await this.getNewMessageContents(state));
  }

  static async getNewMessageContents(
    state: NavigateState
  ): Promise<MessageOptions> {
    let manga = await CubariApi.getManga(state.identifier);

    let chapter: string = state.chapter;
    let page: number = state.page;

    if (chapter in manga.chapters === false) {
      return { content: "404 - Chapter not found." };
    }

    let chapState: ChapterState;

    switch (state.interactionType) {
      case MangaInteractionType.None:
        break;
      case MangaInteractionType.BackChapter:
        chapState = await manga.navigate(chapter, page, -1, 0);
        break;
      case MangaInteractionType.BackPage:
        chapState = await manga.navigate(chapter, page, 0, -1);
        break;
      case MangaInteractionType.ForwardPage:
        chapState = await manga.navigate(chapter, page, 0, 1);
        break;
      case MangaInteractionType.ForwardChapter:
        chapState = await manga.navigate(chapter, page, 1, 0);
        break;
    }

    if (chapState) {
      chapter = chapState.newChapter;
      page = chapState.newPage;
    }

    let chapterData = manga.chapters[chapter];
    const pages = await CubariApi.getPages(manga, chapterData);
    const pageSrc = CubariApi.getPageSrc(manga, pages, page);

    return {
      embeds: [
        {
          title: chapterData.title || chapter,
          url: manga.getCubariUrl(chapter, page),
          description: `Chapter ${chapter} | Page ${page}/${pages.length}`,
          image: {
            url: pageSrc,
          },
          footer: {
            text: `${manga.series_name}, by ${manga.author}.`,
          },
        },
      ],
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.PRIMARY,
              label: "<<",
              custom_id: MangaNavigationStateParser.encodeNavigate(
                {
                  interactionType: MangaInteractionType.BackChapter,
                  identifier: state.identifier,
                  page: page,
                  chapter: chapter,
                },
                "a"
              ),
              // emoji: {
              //   "name": "⏮️"
              // }
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.PRIMARY,
              label: "<",
              custom_id: MangaNavigationStateParser.encodeNavigate(
                {
                  interactionType: MangaInteractionType.BackPage,
                  identifier: state.identifier,
                  page: page,
                  chapter: chapter,
                },
                "a"
              ),
              // emoji: {
              //   "name": "◀️"
              // }
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.PRIMARY,
              label: ">",
              custom_id: MangaNavigationStateParser.encodeNavigate(
                {
                  interactionType: MangaInteractionType.ForwardPage,
                  identifier: state.identifier,
                  page: page,
                  chapter: chapter,
                },
                "a"
              ),
              // emoji: {
              //   "name": "▶️"
              // }
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.PRIMARY,
              label: ">>",
              custom_id: MangaNavigationStateParser.encodeNavigate(
                {
                  interactionType: MangaInteractionType.ForwardChapter,
                  identifier: state.identifier,
                  page: page,
                  chapter: chapter,
                },
                "a"
              ),
              // emoji: {
              //   "name": "⏭️"
              // }
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.DESTRUCTIVE,
              label: "X",
              custom_id: MangaInteractionType.Close.toString(),
            },
          ],
        },
      ],
    };
  }
}
