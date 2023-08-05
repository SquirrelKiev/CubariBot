import {
  SlashCommand,
  CommandContext,
  SlashCreator,
  CommandOptionType,
} from "slash-create";
import { DbManager } from "../utilities/DbManager";
import { GuildPrefs, Prefs, UserPrefs } from "../utilities/DbTypes";

export default class DefaultMangaCommand extends SlashCommand {
  private dbManager: DbManager;

  constructor(creator: SlashCreator) {
    super(creator, {
      name: "default-manga",
      description: "configuring the default manga",
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

    switch (ctx.subcommands[0]) {
      case "server":
        this.handleConfig(
          ctx,
          ctx.guildID,
          "defaultManga",
          ctx.options[ctx.subcommands[0]]["url"],
          "server"
        );
        break;
      case "channel":
        this.handleConfig(
          ctx,
          ctx.channelID,
          "defaultManga",
          ctx.options[ctx.subcommands[0]]["url"],
          "channel"
        );
        break;
      case "user":
        this.handleConfig(
          ctx,
          ctx.user.id,
          "defaultManga",
          ctx.options[ctx.subcommands[0]]["url"],
          "user"
        );
        break;
    }
  }

  async handleConfig(
    ctx: CommandContext,
    id: string,
    key: string,
    value: string,
    type: "server" | "channel" | "user"
  ) {
    let prefs: Prefs;
    try {
      switch (type) {
        case "server":
          prefs = await this.dbManager.getGuildPrefs(id);
          break;

        case "channel":
          prefs = await this.dbManager.getChannelPrefs(id);
          break;

        case "user":
          prefs = await this.dbManager.getUserPrefs(id);
          break;

        default:
          throw new Error("not a valid type!");
      }
    } catch (error) {
      console.error(`Error getting prefs: ${error}`);
      ctx.send("Error getting config. Please try again later.");
      return;
    }

    if (value) {
      try {
        switch (type) {
          case "server":
            await this.dbManager.setGuildPrefs(id, { [key]: value });
            break;

          case "channel":
            await this.dbManager.setChannelPrefs(id, { [key]: value });
            break;

          case "user":
            await this.dbManager.setUserPrefs(id, { [key]: value });
            break;

          default:
            throw new Error("not a valid type!");
        }
        ctx.send(`Successfully set ${key} to ${value}`);
      } catch (error) {
        console.error(`Error setting prefs: ${error}`);
        ctx.send("Error setting config. Please try again later.");
      }
    } else {
      if (key in prefs && prefs[key] !== null) {
        ctx.send(`The value of ${key} is \`${prefs[key]}\``);
      } else {
        ctx.send(`No value set for \`${key}\``);
      }
    }
  }
}
