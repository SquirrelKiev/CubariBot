import { AzureFunctionServer, SlashCreator } from "slash-create";
import path = require("path");
import interactionHandler from "./misc/InteractionHandler";

const creator = new SlashCreator({
  applicationID: process.env.DISCORD_APP_ID,
  publicKey: process.env.DISCORD_PUBLIC_KEY,
  token: process.env.DISCORD_BOT_TOKEN,
});

creator
  .withServer(new AzureFunctionServer(module.exports))
  .registerCommandsIn(path.join(__dirname, "commands"))
  .syncCommands()
  .on("componentInteraction", interactionHandler);
