import {
  SlashCommand,
  CommandContext,
  SlashCreator,
  CommandOptionType,
} from "slash-create";
import { DbManager } from "../database/DbManager";
import { parseMangaUrl } from "../misc/ParseUrl";
import { Channel } from "slash-create/lib/structures/channel";

export default class DefaultMangaCommand extends SlashCommand {
  private dbManager: DbManager;

  constructor(creator: SlashCreator) {
    super(creator, {
      name: "default-manga",
      description: "Gets the current default manga.",
      options: [
        {
          type: CommandOptionType.SUB_COMMAND,
          name: "server",
          description: "change the server's default manga.",
          options: [
            {
              type: CommandOptionType.STRING,
              name: "url",
              description: "The url to set as the default.",
              required: false,
            },
          ],
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: "channel",
          description: "change the channel's default manga.",
          options: [
            {
              type: CommandOptionType.CHANNEL,
              name: "channel",
              description: "The channel to set.",
              required: true,
            },
            {
              type: CommandOptionType.STRING,
              name: "url",
              description: "The url to set as the default.",
              required: false,
            },
          ],
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: "user",
          description: "change your default manga.",
          options: [
            {
              type: CommandOptionType.STRING,
              name: "url",
              description: "The url to set as the default.",
              required: false,
            },
          ],
        },
      ],
    });

    this.filePath = __filename;
    this.dbManager = DbManager.getInstance();
  }

  async run(ctx: CommandContext) {
    ctx.defer();

    if (!ctx.guildID) {
      ctx.send("not in a guild");
      return;
    }

    let result = null;
    let url: string | null = ctx.options[ctx.subcommands[0]]["url"];
    let set: boolean = false;

    if (url && url !== "none") {
      const parsed = parseMangaUrl(url);
      if (parsed) {
        url = `${encodeURIComponent(parsed.platform)}/${encodeURIComponent(parsed.series)}`;
        set = true;
      } else {
        ctx.send("Not a valid link to a manga.");
        return;
      }
    }

    switch (ctx.subcommands[0]) {
      case "server":
        result = await this.handleConfig(
          ctx.guildID,
          "defaultManga",
          url,
          "server"
        );
        break;
      case "channel":
        const subcommandName = ctx.subcommands[0];
        const subcommandData = ctx.options[subcommandName];
        const channelId = subcommandData["channel"];

        result = await this.handleConfig(
          channelId,
          "defaultManga",
          url,
          "channel"
        );
        break;
      case "user":
        result = await this.handleConfig(
          ctx.user.id,
          "defaultManga",
          url,
          "user"
        );
        break;
    }

    if (result === null) {
      ctx.send("Not set.");
  } else if (set) {
      ctx.send(`Successfully set the ${ctx.subcommands[0]}'s default manga to \`${result}\``);
  } else {
      ctx.send(`the ${ctx.subcommands[0]}'s default manga is \`${result}\``);
  }
  
  }

  async handleConfig(
    id: string,
    key: string,
    value: any,
    type: "server" | "channel" | "user"
  ): Promise<string | null> {
    const typeFunctionMap = {
      server: {
        get: this.dbManager.getGuildPrefs.bind(this.dbManager),
        set: this.dbManager.setGuildPrefs.bind(this.dbManager),
      },
      channel: {
        get: this.dbManager.getChannelPrefs.bind(this.dbManager),
        set: this.dbManager.setChannelPrefs.bind(this.dbManager),
      },
      user: {
        get: this.dbManager.getUserPrefs.bind(this.dbManager),
        set: this.dbManager.setUserPrefs.bind(this.dbManager),
      },
    };

    if (!typeFunctionMap[type]) {
      throw new Error("not a valid type!");
    }

    let prefs = await typeFunctionMap[type].get(id);

    if (value) {
      let modifiedValue = value === "none" ? null : value;

      await typeFunctionMap[type].set(id, { [key]: modifiedValue });
      return value;
    } else {
      if (key in prefs && prefs[key] !== null) {
        return prefs[key];
      } else {
        return null;
      }
    }
  }
}
