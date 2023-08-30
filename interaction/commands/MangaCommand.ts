import {
  SlashCommand,
  CommandContext,
  SlashCreator,
  CommandOptionType,
} from "slash-create";
import {
  DebugPageType,
  InteractionType,
} from "../misc/InteractionIdSerializer";
import { MangaNavigationHandler } from "../manga/MangaNavigationHandler";
import { config } from "../Config";
import { parseMangaUrl } from "../misc/ParseUrl";
import { DbManager } from "../database/DbManager";
import { DibariSlashCommand } from "../misc/DibariSlashCommand";
import { DebugCommandHandler } from "../misc/DebugCommandHandler";

export default class MangaCommand extends DibariSlashCommand {
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
    this.longDescription =
      "Gets a page from a chapter of a manga. " +
      "URL can be any supported link supported by cubari, plus cubari.moe links, plus a custom format of `platform/series`, e.g. `mangasee/Oshi-no-Ko`.";
  }

  async run(ctx: CommandContext) {
    await ctx.defer();

    if (ctx.options.url === "super secret debug") {
      ctx.send(
        await DebugCommandHandler.run(
          {
            interactionType: InteractionType.Debug_SwitchPage,
            page: DebugPageType.Main,
          },
          ctx.user.id
        )
      );
      return;
    }

    let identifier = parseMangaUrl(
      ctx.options.url ??
        (await DbManager.getInstance().getDefaultManga(
          ctx.guildID,
          ctx.channelID,
          ctx.user.id
        ))
    );

    if (
      !identifier ||
      identifier.platform === null ||
      identifier.series === null
    ) {
      ctx.send(config.invalidLinkError);
      return;
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
