import {
  ButtonStyle,
  ComponentContext,
  ComponentType,
  MessageOptions,
} from "slash-create";
import {
  MangaInteractionType,
  NavigateState,
  StateParser,
} from "./StateParser";
import { ChapterState, DEFAULT_CUBARI_URL, Manga, getCacheKey } from "./Manga";

export class DiscordUtility {
  static async handleNavigationInteraction(ctx: ComponentContext) {
    let state: NavigateState = StateParser.decodeNavigate(ctx.customID);

    ctx.editParent(await this.getNewMessageContents(state));
  }

  static async getNewMessageContents(
    state: NavigateState
  ): Promise<MessageOptions> {
    let mangaGet: Response = await fetch(
      `${DEFAULT_CUBARI_URL}/read/api/${encodeURIComponent(
        state.platform
      )}/series/${encodeURIComponent(state.series)}/`
    );

    if(mangaGet.status !== 200){
        return {content: `${mangaGet.status} - assuming the manga doesnt exist?`}
    }

    let manga: Manga = new Manga(await mangaGet.text(), state.platform);
    let chapter: string = state.chapter;
    let page: number = state.page;

    if(chapter in manga.chapters === false){
        return {content: "404 - Chapter not found."}
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
      getCacheKey(state.platform, state.series, chapter)
    );

    if(page - 1 > pages.length - 1 || page - 1 < 0){
        return {content: "Invalid page. " + page};
    }

    return {
      embeds: [
        {
          title: chapterGroup.title,
          url: `${DEFAULT_CUBARI_URL}/read/${encodeURIComponent(
            state.platform
          )}/${encodeURIComponent(state.series)}/${chapter}/${page}`,
          description: `Chapter ${chapter} | Page ${page}/${pages.length}`,
          image: {
            url: pages[page - 1],
          },
          footer: {
            text: `${manga.series_name}, by ${manga.author}.`
          }
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
              custom_id: StateParser.encodeNavigate(
                {
                  interactionType: MangaInteractionType.BackChapter,
                  platform: state.platform,
                  series: state.series,
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
              custom_id: StateParser.encodeNavigate(
                {
                  interactionType: MangaInteractionType.BackPage,
                  platform: state.platform,
                  series: state.series,
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
              custom_id: StateParser.encodeNavigate(
                {
                  interactionType: MangaInteractionType.ForwardPage,
                  platform: state.platform,
                  series: state.series,
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
              custom_id: StateParser.encodeNavigate(
                {
                  interactionType: MangaInteractionType.ForwardChapter,
                  platform: state.platform,
                  series: state.series,
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
