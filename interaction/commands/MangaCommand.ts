import {
  SlashCommand,
  CommandContext,
  SlashCreator,
  CommandOptionType,
} from "slash-create";
import { MangaInteractionType } from "../utilities/MangaNavigationStateParser";
import { MangaNavigationHandler } from "../utilities/MangaNavigationHandler";
import { config } from "../../Config";
import { parseMangaUrl } from "../utilities/ParseUrl";

export default class MangaCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: "manga",
      description: "Gets a page from a chapter of a manga.",
      options: [{
        type: CommandOptionType.STRING,
        name: "chapter",
        description: "Which chapter of the manga?",
        required: true
      },
      {
        type: CommandOptionType.INTEGER,
        name: "page",
        description: `Which page of that chapter? Default: Page ${config.defaultPage}`,
        required: false
      },
      {
        type: CommandOptionType.STRING,
        name: "url",
        description: `The manga to get. Default: ${config.defaultManga}`,
        required: false
      }
      ],
    });

    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    await ctx.defer();

    let identifier = parseMangaUrl(ctx.options.url ?? config.defaultManga);

    if(!identifier){
      ctx.send("Invalid URL.");
    }

    let chapter: string = ctx.options.chapter;
    let page: number = ctx.options.page ?? config.defaultPage;

    ctx.send(await MangaNavigationHandler.getNewMessageContents({
      interactionType: MangaInteractionType.None,
      identifier: identifier,
      chapter: chapter,
      page: page
    }));
  }  
}
