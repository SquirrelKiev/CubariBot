import {
  SlashCommand,
  CommandContext,
  SlashCreator,
  CommandOptionType,
} from "slash-create";
import { SearchHandler } from "../search/SearchHandler";
import { InteractionType, SearchState } from "../manga/InteractionIdSerializer";



export default class SearchCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: "search",
      description: "Searches MangaDex for the query provided. (searches titles, sorted by relevance.)",
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

    const state: SearchState = {
      interactionType: InteractionType.Search_SearchForManga,
      query: ctx.options["query"],
      offset: 0
    }

    ctx.send(await SearchHandler.getNewMessageContents(state));
  }
}
