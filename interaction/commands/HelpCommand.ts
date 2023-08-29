import { CommandContext, SlashCreator, EmbedField } from "slash-create";
import { config } from "../Config";
import { DibariSlashCommand } from "../misc/DibariSlashCommand";

export default class MangaCommand extends DibariSlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: "manga-help",
      description: "Shows some extra information about the commands.",
    });

    this.filePath = __filename;
    this.longDescription = "Brings up this page!";
  }

  async run(ctx: CommandContext) {
    await ctx.defer();

    let fields: EmbedField[] = [];

    ctx.creator.commands.forEach((element: DibariSlashCommand) => {
      const desc: string = element.longDescription || element.description;

      fields.push({
        name: `/${element.commandName}`,
        value: desc,
      });
    });

    fields.sort((a, b) => a.name.localeCompare(b.name));

    await ctx.send({
      embeds: [
        {
          fields: fields,
          color: config.embedColor
        },
      ],
    });
  }
}
