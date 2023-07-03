import {
  SlashCommand,
  ComponentType,
  ButtonStyle,
  CommandContext,
  ComponentContext,
  SlashCreator,
  CommandOptionType,
} from "slash-create";
import { StateParser, NavigateState, MangaInteractionType } from "../utilities/StateParser";
import { Chapter, DEFAULT_CUBARI_URL, Manga } from "../utilities/Manga";
import { DiscordUtility } from "../utilities/DiscordUtility";

export default class PingCommand extends SlashCommand {
  static defaultPage: number = 1;
  static defaultPlatform: string = "mangasee";
  static defaultSeries: string = "Oshi-no-Ko";

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
        description: `Which page of that chapter? Default: Page ${PingCommand.defaultPage}`,
        required: false
      },
      {
        type: CommandOptionType.STRING,
        name: "platform",
        description: `The platform to get the series from. This can be figured from the URL. Default: ${PingCommand.defaultPlatform}`,
        required: false
      },
      {
        type: CommandOptionType.STRING,
        name: "series",
        description: `The series to get. This can be figured from the URL. Default: ${PingCommand.defaultSeries}`,
        required: false
      }
      ],
    });

    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    await ctx.defer();

    let chapter: string = ctx.options.chapter;
    let page: number = ctx.options.page ?? PingCommand.defaultPage;
    let platform: string = ctx.options.platform ?? PingCommand.defaultPlatform;
    let series: string = ctx.options.series ?? PingCommand.defaultSeries;

    ctx.send(await DiscordUtility.getNewMessageContents({
      interactionType: MangaInteractionType.None,
      platform: platform,
      series: series,
      chapter: chapter,
      page: page
    }));
  }  
}
