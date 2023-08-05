import { AzureFunctionServer, SlashCreator } from "slash-create";
import path = require("path");
import { MangaNavigationHandler } from "./utilities/MangaNavigationHandler";
import {
  MangaInteractionType,
  MangaNavigationStateParser,
} from "./utilities/MangaNavigationStateParser";

const creator = new SlashCreator({
  applicationID: process.env.DISCORD_APP_ID,
  publicKey: process.env.DISCORD_PUBLIC_KEY,
  token: process.env.DISCORD_BOT_TOKEN,
  
});

creator
  .withServer(new AzureFunctionServer(module.exports))
  .registerCommandsIn(path.join(__dirname, "commands"))
  .syncCommands()
  .on("componentInteraction", (ctx) => {
    if (ctx.message.interaction.user.id !== ctx.user.id) {
      ctx.send(
        "You did not originally trigger this message. Please enter the command yourself.",
        { ephemeral: true }
      );
      return;
    }

    let interactionType: MangaInteractionType =
      MangaNavigationStateParser.getInteractionType(ctx.customID);

    switch (interactionType) {
      case MangaInteractionType.BackChapter:
      case MangaInteractionType.BackPage:
      case MangaInteractionType.ForwardChapter:
      case MangaInteractionType.ForwardPage:
        MangaNavigationHandler.handleNavigationInteraction(ctx);
        break;
      case MangaInteractionType.Close:
        ctx.message.delete();
        break;

      default:
        break;
    }
  });
