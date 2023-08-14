import { ComponentContext } from "slash-create";
import {
  MangaInteractionType as InteractionType,
  MangaNavigationStateParser as InteractionStateParser,
} from "../manga/MangaNavigationStateParser";
import { MangaNavigationHandler } from "../manga/MangaNavigationHandler";

export default function interactionHandler(ctx: ComponentContext) {
  if (ctx.message.interaction.user.id !== ctx.user.id) {
    ctx.send(
      "You did not originally trigger this message. Please enter the command yourself.",
      { ephemeral: true }
    );
    return;
  }

  let interactionType: InteractionType =
    InteractionStateParser.getInteractionType(ctx.customID);

  switch (interactionType) {
    case InteractionType.BackChapter:
    case InteractionType.BackPage:
    case InteractionType.ForwardChapter:
    case InteractionType.ForwardPage:
      MangaNavigationHandler.handleNavigationInteraction(ctx);
      break;
    case InteractionType.Close:
      ctx.message.delete();
      break;

    default:
      break;
  }
}
