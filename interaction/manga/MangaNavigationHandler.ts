import {
  ButtonStyle,
  ComponentContext,
  ComponentType,
  MessageOptions,
} from "slash-create";
import {
  InteractionType as InteractionType,
  NavigateState,
  InteractionIdSerializer,
} from "./InteractionIdSerializer";
import { ChapterState } from "./MangaTypes";
import CubariApi from "../misc/CubariApi";
import MangaDexApi from "../misc/mangadexapi/MangaDexApi";

export class MangaNavigationHandler {
  static async handleNavigationInteraction(ctx: ComponentContext) {
    let state: NavigateState = InteractionIdSerializer.decodeMangaNavigate(
      ctx.customID
    );

    ctx.editParent(await this.getNewMessageContents(state));
  }

  static async getNewMessageContents(
    state: NavigateState
  ): Promise<MessageOptions> {
    let manga = await CubariApi.getManga(state.identifier);

    let chapter: string = state.chapter ?? manga.getSortedChapterKeys()[0];
    let page: number = state.page ?? 1;

    if (chapter in manga.chapters === false) {
      return { content: "404 - Chapter not found." };
    }

    let chapState: ChapterState;

    switch (state.interactionType) {
      case InteractionType.Manga_Open:
        break;
      case InteractionType.Manga_BackChapter:
        chapState = await manga.navigate(chapter, page, -1, 0);
        break;
      case InteractionType.Manga_BackPage:
        chapState = await manga.navigate(chapter, page, 0, -1);
        break;
      case InteractionType.Manga_ForwardPage:
        chapState = await manga.navigate(chapter, page, 0, 1);
        break;
      case InteractionType.Manga_ForwardChapter:
        chapState = await manga.navigate(chapter, page, 1, 0);
        break;
      default:
        throw new Error("InteractionType not implemented!");
    }

    if (chapState) {
      chapter = chapState.newChapter;
      page = chapState.newPage;
    }

    const chapterData = manga.chapters[chapter];
    const pages = await CubariApi.getPages(manga, chapterData);
    const pageSrc = CubariApi.getPageSrc(manga, pages.srcs, page);

    let author = manga.author;
    if(manga.identifier.platform === "mangadex"){
      author = (await MangaDexApi.getMangaById(manga.identifier.series)).author;
    }

    return {
      embeds: [
        {
          title: chapterData.title || chapter,
          url: manga.getCubariUrl(chapter, page),
          description: `Chapter ${chapter} | Page ${page}/${pages.srcs.length}`,
          image: {
            url: pageSrc,
          },
          footer: {
            text: `${manga.series_name}, by ${author}, Group: ${manga.groups[pages.groupKey]}`,
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
              custom_id: InteractionIdSerializer.encodeMangaNavigate(
                {
                  interactionType: InteractionType.Manga_BackChapter,
                  identifier: state.identifier,
                  page: page,
                  chapter: chapter,
                }
              ),
              // emoji: {
              //   "name": "⏮️"
              // }
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.PRIMARY,
              label: "<",
              custom_id: InteractionIdSerializer.encodeMangaNavigate(
                {
                  interactionType: InteractionType.Manga_BackPage,
                  identifier: state.identifier,
                  page: page,
                  chapter: chapter,
                },
              ),
              // emoji: {
              //   "name": "◀️"
              // }
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.PRIMARY,
              label: ">",
              custom_id: InteractionIdSerializer.encodeMangaNavigate(
                {
                  interactionType: InteractionType.Manga_ForwardPage,
                  identifier: state.identifier,
                  page: page,
                  chapter: chapter,
                },
              ),
              // emoji: {
              //   "name": "▶️"
              // }
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.PRIMARY,
              label: ">>",
              custom_id: InteractionIdSerializer.encodeMangaNavigate(
                {
                  interactionType: InteractionType.Manga_ForwardChapter,
                  identifier: state.identifier,
                  page: page,
                  chapter: chapter,
                },
              ),
              // emoji: {
              //   "name": "⏭️"
              // }
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.DESTRUCTIVE,
              label: "X",
              custom_id: InteractionType.Close.toString(),
            },
          ],
        },
      ],
    };
  }
}

