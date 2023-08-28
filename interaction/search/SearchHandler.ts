import {
  InteractionIdSerializer,
  InteractionType,
  SearchState,
} from "../manga/InteractionIdSerializer";
import { config } from "../Config";
import {
  ButtonStyle,
  ComponentContext,
  ComponentSelectOption,
  ComponentType,
  EmbedField,
  MessageOptions,
} from "slash-create";
import { truncate as truncateString } from "../misc/MiscUtility";
import MangaDexApi from "../misc/mangadexapi/MangaDexApi";

export class SearchHandler {
  static async handleNavigationInteraction(ctx: ComponentContext) {
    let state: SearchState = InteractionIdSerializer.decodeSearchNavigate(
      ctx.customID
    );

    ctx.editParent(await this.getNewMessageContents(state));
  }
  static async getNewMessageContents(
    state: SearchState
  ): Promise<MessageOptions> {
    let deltaOffset: number;

    switch (state.interactionType) {
      case InteractionType.Search_SearchForManga:
        deltaOffset = 0;
        break;

      case InteractionType.Search_ForwardPage:
        deltaOffset = config.mangadexPaginationLimit;
        break;

      case InteractionType.Search_BackPage:
        deltaOffset = -config.mangadexPaginationLimit;
        break;

      default:
        throw new Error(`Unsupported interaction type ${state.interactionType}`);
        
    }

    const results = await MangaDexApi.search({
      title: state.query,
      limit: config.mangadexPaginationLimit,
      offset: state.offset + deltaOffset,
      order: {
        relevance: "desc",
      },
    });

    if (results.data.length === 0) {
      return {
        content: "No results found!",
      };
    }

    let fields: EmbedField[] = [];
    let selectOptions: ComponentSelectOption[] = [];

    results.data.forEach((manga, index) => {
      const title = manga.title
        ? truncateString(manga.title, 50, true)
        : "No title??";
      const description = manga.description
        ? truncateString(manga.description, 200, true)
        : "No description.";

      fields.push({
        name: `${title}, by ${manga.author}`,
        value: description,
      });

      selectOptions.push({
        label: title,
        value: InteractionIdSerializer.encodeSearchSelect(manga.id),
      });
    });

    const totalPages = Math.ceil(results.total / results.limit);
    const currentPage = Math.ceil(results.offset / results.limit) + 1;

    return {
      embeds: [
        {
          color: config.embedColor,
          fields,
          footer: {
            text: `Page ${currentPage}/${totalPages} - ${results.total} results`,
          },
        },
      ],
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.STRING_SELECT,
              custom_id: "search_select",
              placeholder: "Choose the manga to read...",
              options: selectOptions,
            },
          ],
        },
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.BUTTON,
              style: config.defaultButtonStyle,
              custom_id: InteractionIdSerializer.encodeSearchNavigate({
                interactionType: InteractionType.Search_BackPage,
                query: state.query,
                offset: results.offset,
              }),
              label: "<",
              disabled: currentPage === 1
            },
            {
              type: ComponentType.BUTTON,
              style: config.defaultButtonStyle,
              custom_id: InteractionIdSerializer.encodeSearchNavigate({
                interactionType: InteractionType.Search_ForwardPage,
                query: state.query,
                offset: results.offset,
              }),
              label: ">",
              disabled: currentPage === totalPages
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.DESTRUCTIVE,
              custom_id: InteractionType.Close.toString(),
              label: "X",
            },
          ],
        },
      ],
    };
  }
}
