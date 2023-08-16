import {
  SlashCommand,
  CommandContext,
  SlashCreator,
  CommandOptionType,
  EmbedField,
} from "slash-create";

/* eslint-disable */
import MFA from "mangadex-full-api";
import { MangaNavigationHandler } from "../manga/MangaNavigationHandler";
import { SeriesIdentifier } from "../manga/MangaTypes";
import {
  MangaInteractionType,
  MangaNavigationStateParser,
} from "../manga/MangaNavigationStateParser";
import { config } from "../Config";

export default class SearchCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: "search",
      description: "Gets a page from a chapter of a manga.",
      options: [
        {
          type: CommandOptionType.STRING,
          name: "query",
          description: "What manga are you after?",
          required: true,
        },
      ],
    });

    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    await ctx.defer();

    const results = await MFA.Manga.search({
        title: ctx.options["query"],
        limit: config.mangadexPaginationLimit,
        order: {
            relevance: "desc"
        }
    });

    let fields: EmbedField[] = results.map((manga): EmbedField => {
        return {
            name: manga.title,
            value: "something cool"
        };
    })

    ctx.send({
      embeds: [
        {
          fields,
        },
      ],
    });
  }
}
