import {
  SlashCommand,
  CommandContext,
  SlashCreator,
  CommandOptionType,
} from "slash-create";
import { InteractionType } from "../manga/InteractionIdSerializer";
import { MangaNavigationHandler } from "../manga/MangaNavigationHandler";
import { config } from "../Config";
import { parseMangaUrl } from "../misc/ParseUrl";
import { DbManager } from "../database/DbManager";

export default class MangaCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: "manga",
      description: "Gets a page from a chapter of a manga.",
      options: [
        {
          type: CommandOptionType.STRING,
          name: "chapter",
          description: "Which chapter of the manga?",
          required: false,
        },
        {
          type: CommandOptionType.INTEGER,
          name: "page",
          description: `Which page of that chapter?`,
          required: false,
        },
        {
          type: CommandOptionType.STRING,
          name: "url",
          description: `The manga to get. Will be the server's/channel's/user's default manga otherwise.`,
          required: false,
        },
      ],
    });

    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    await ctx.defer();

    let identifier = parseMangaUrl(
      ctx.options.url ??
        (await DbManager.getInstance().getDefaultManga(
          ctx.guildID,
          ctx.channelID,
          ctx.user.id
        ))
    );

    if (!identifier) {
      ctx.send("Invalid URL.");
    }

    let chapter: string = ctx.options.chapter;
    let page: number = ctx.options.page;

    ctx.send(
      await MangaNavigationHandler.getNewMessageContents({
        interactionType: InteractionType.Manga_Open,
        identifier: identifier,
        chapter: chapter,
        page: page,
      })
    );
  }
}
