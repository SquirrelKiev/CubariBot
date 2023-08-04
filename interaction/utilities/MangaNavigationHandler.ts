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
import { ChapterState, Manga, getCacheKey } from "./MangaTypes";
import { config } from "../Config";

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
    let mangaGet: Response = await fetch(
      `${config.cubariUrl}/read/api/${encodeURIComponent(
        state.identifier.platform
      )}/series/${encodeURIComponent(state.identifier.series)}/`
    );

    if (mangaGet.status !== 200) {
      return {
        content: `${mangaGet.status} - assuming the manga doesnt exist?`,
      };
    }

    let manga: Manga = new Manga(
      await mangaGet.text(),
      state.identifier.platform
    );
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
        chapter = chapState.newChapter;
        page = chapState.newPage;
        break;
      case MangaInteractionType.BackPage:
        chapState = await manga.navigate(chapter, page, 0, -1);
        chapter = chapState.newChapter;
        page = chapState.newPage;
        break;
      case MangaInteractionType.ForwardPage:
        chapState = await manga.navigate(chapter, page, 0, 1);
        chapter = chapState.newChapter;
        page = chapState.newPage;
        break;
      case MangaInteractionType.ForwardChapter:
        chapState = await manga.navigate(chapter, page, 1, 0);
        chapter = chapState.newChapter;
        page = chapState.newPage;
        break;
    }

    let chapterGroup = manga.chapters[chapter];
    let pages: string[] = await chapterGroup.getImageSrcs(
      getCacheKey(state.identifier, chapter)
    );

    if (page - 1 > pages.length - 1 || page - 1 < 0) {
      return { content: "Invalid page. " + page };
    }

    let imageUrl: string = pages[page - 1];

    if (config.shouldProxyImages(state.identifier.platform)) {
      imageUrl = `${config.proxyUrl}${encodeURIComponent(imageUrl)}`;
    }

    return {
      embeds: [
        {
          title: chapterGroup.title,
          url: `${config.cubariUrl}/read/${encodeURIComponent(
            state.identifier.platform
          )}/${encodeURIComponent(state.identifier.series)}/${chapter}/${page}`,
          description: `Chapter ${chapter} | Page ${page}/${pages.length}`,
          image: {
            url: imageUrl,
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
