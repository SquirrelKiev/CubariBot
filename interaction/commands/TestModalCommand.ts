import {
  SlashCommand,
  ComponentType,
  ButtonStyle,
  CommandContext,
  ComponentContext,
  SlashCreator,
  TextInputStyle,
} from "slash-create";

export default class TestModalCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: "farts",
      description: "Tests if the bot is up.",
      options: [],
    });

    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    await ctx.sendModal({
      custom_id: "fartsfartsfarts",
      title: "Jump",
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.TEXT_INPUT,
              custom_id: "text",
              label: "Chapter",
              style: TextInputStyle.SHORT,
            },
          ],
        },
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.TEXT_INPUT,
              custom_id: "text2",
              label: "Page",
              style: TextInputStyle.SHORT,
            },
          ],
        },
      ],
    });
  }
}
