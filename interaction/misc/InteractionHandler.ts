import { ComponentContext } from "slash-create";
import {
  InteractionType,
  InteractionIdSerializer,
} from "../manga/InteractionIdSerializer";
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
    InteractionIdSerializer.getInteractionType(ctx.customID);

  switch (interactionType) {
    case InteractionType.Manga_BackChapter:
    case InteractionType.Manga_BackPage:
    case InteractionType.Manga_ForwardChapter:
    case InteractionType.Manga_ForwardPage:
      MangaNavigationHandler.handleNavigationInteraction(ctx);
      break;
    case InteractionType.Close:
      ctx.message.delete();
      break;

    default:
      break;
  }
}
