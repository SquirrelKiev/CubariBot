/* eslint-disable */
import MFA from "mangadex-full-api";
import {
    InteractionIdSerializer,
  InteractionType,
  SearchState,
} from "../manga/InteractionIdSerializer";
import { config } from "../Config";
import { ButtonStyle, ComponentButton, ComponentType, EmbedField, MessageOptions } from "slash-create";

export class SearchHandler {
  static async getMessageContents(state: SearchState): Promise<MessageOptions> {
    const results = await MFA.Manga.search({
      title: state.query,
      limit: config.mangadexPaginationLimit,
      offset: 0,
      order: {
        relevance: "desc",
      },
    });

    let fields: EmbedField[] = results.map((manga): EmbedField => {
      return {
        name: manga.title,
        value: "something cool",
      };
    });

    let mangaButtons: ComponentButton[] = results.map((manga, index): ComponentButton => {
        return {
            type: ComponentType.BUTTON,
            style: ButtonStyle.PRIMARY,
            custom_id: InteractionIdSerializer.encodeSelect(manga.id, index.toString()),
            label: (index+1).toString()
        };
    })

    return {
      embeds: [
        {
          fields,
        },
      ],
      components: [
        {
            type: ComponentType.ACTION_ROW,
            components: [
                {
                    type: ComponentType.BUTTON,
                    style: ButtonStyle.PRIMARY,
                    custom_id: "back",
                    label: "<"
                },
                {
                    type: ComponentType.BUTTON,
                    style: ButtonStyle.PRIMARY,
                    custom_id: "forward",
                    label: ">"
                },
                {
                    type: ComponentType.BUTTON,
                    style: ButtonStyle.DESTRUCTIVE,
                    custom_id: "close",
                    label: "X"
                },
            ]
        },
        {
            type: ComponentType.ACTION_ROW,
            components: mangaButtons
        }
      ]
    };
  }
}
