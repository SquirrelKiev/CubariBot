import {
  SlashCommand,
  ComponentType,
  ButtonStyle,
  CommandContext,
  ComponentContext,
  SlashCreator,
} from "slash-create";

export default class PingCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: "ping",
      description: "Tests if the bot is up.",
      options: [],
    });

    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    await ctx.defer();

    await ctx.send("hello!");
  }
}
