import { AzureFunctionServer, SlashCreator } from "slash-create";
import path = require("path");
import { DiscordUtility } from "./utilities/DiscordUtility";
import { MangaInteractionType, StateParser } from "./utilities/StateParser";

const creator = new SlashCreator({
  applicationID: process.env.DISCORD_APP_ID,
  publicKey: process.env.DISCORD_PUBLIC_KEY,
  token: process.env.DISCORD_BOT_TOKEN,
});

creator
  // The first argument is required, but the second argument is the "target" or the name of the export.
  // By default, the target is "interactions".
  .withServer(new AzureFunctionServer(module.exports))
  .registerCommandsIn(path.join(__dirname, "commands"))
  // Syncing the commands each time the function is executed is wasting computing time
  .syncCommands()
  .on("componentInteraction", (ctx) => {
    if (ctx.message.interaction.user.id !== ctx.user.id) {
      ctx.send(
        "You did not originally trigger this message. Please enter the command yourself.",
        { ephemeral: true }
      );
      return;
    }

    let interactionType: MangaInteractionType = StateParser.getInteractionType(
      ctx.customID
    );

    switch (interactionType) {
      case MangaInteractionType.BackChapter:
      case MangaInteractionType.BackPage:
      case MangaInteractionType.ForwardChapter:
      case MangaInteractionType.ForwardPage:
        DiscordUtility.handleNavigationInteraction(ctx);
        break;
      case MangaInteractionType.Close:
        ctx.message.delete();
        break;

      default:
        break;
    }
  });
