import {
  SlashCommand,
  CommandContext,
  SlashCreator,
  CommandOptionType,
} from "slash-create";
import { DbManager } from "../database/DbManager";
import { Prefs } from "../database/DbTypes";

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

    let result = null;
    switch (ctx.subcommands[0]) {
      case "server":
        result = await this.handleConfig(
          ctx.guildID,
          "defaultManga",
          ctx.options[ctx.subcommands[0]]["url"],
          "server"
        );
        break;
      case "channel":
        result = await this.handleConfig(
          ctx.channelID,
          "defaultManga",
          ctx.options[ctx.subcommands[0]]["url"],
          "channel"
        );
        break;
      case "user":
        result = await this.handleConfig(
          ctx.user.id,
          "defaultManga",
          ctx.options[ctx.subcommands[0]]["url"],
          "user"
        );
        break;
    }

    // Send the result of the operation back to the channel
    if (result instanceof Error) {
      ctx.send(`Error: ${result.message}. Please try again later.`);
    } else {
      ctx.send(result);
    }
  }

  async handleConfig(
    id: string,
    key: string,
    value: string,
    type: "server" | "channel" | "user"
  ): Promise<string> {
    let prefs: Prefs;

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

    if (value) {
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
      return `Successfully set ${key} to ${value}`;
    } else {
      if (key in prefs && prefs[key] !== null) {
        return `The value of ${key} is \`${prefs[key]}\``;
      } else {
        return `No value set for \`${key}\``;
      }
    }
  }
}
