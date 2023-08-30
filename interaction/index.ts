import { AzureFunctionServer, SlashCreator } from "slash-create";
import path = require("path");
import interactionHandler from "./misc/InteractionHandler";
import { debugInfoInit } from "./misc/MiscUtility";

const creator = new SlashCreator({
  applicationID: process.env.DISCORD_APP_ID,
  publicKey: process.env.DISCORD_PUBLIC_KEY,
  token: process.env.DISCORD_BOT_TOKEN,
});

debugInfoInit();

creator
  .withServer(new AzureFunctionServer(module.exports))
  .registerCommandsIn(path.join(__dirname, "commands"))
  .syncCommands()
  .on("componentInteraction", interactionHandler)
  .on("commandError", (command, err, ctx) => {
    console.error(err);
    ctx.send(
      `Error: ${
        err.message.length < 1000
          ? `\`${err.message}\``
          : `but the error was too long, so heres the best i can do: \`${err.name}\``
      }`
    );
  });
