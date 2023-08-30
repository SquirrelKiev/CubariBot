import { ComponentContext, ComponentType } from "slash-create";
import {
  InteractionType,
  InteractionIdSerializer,
  DebugPageType,
} from "./InteractionIdSerializer";
import { MangaNavigationHandler } from "../manga/MangaNavigationHandler";
import { SearchHandler } from "../search/SearchHandler";
import { DebugCommandHandler } from "./DebugCommandHandler";

export default async function interactionHandler(ctx: ComponentContext) {
  if (ctx.message.interaction.user.id !== ctx.user.id) {
    ctx.send(
      "You did not originally trigger this message. Please enter the command yourself.",
      { ephemeral: true }
    );
    return;
  }

  let id: string;

  switch (ctx.componentType) {
    case ComponentType.BUTTON:
      id = ctx.customID;
      break;

    case ComponentType.STRING_SELECT:
      id = ctx.values[0];
      break;

    default:
      break;
  }

  let interactionType: InteractionType =
    InteractionIdSerializer.getInteractionType(id);

  switch (interactionType) {
    case InteractionType.Manga_BackChapter:
    case InteractionType.Manga_BackPage:
    case InteractionType.Manga_ForwardChapter:
    case InteractionType.Manga_ForwardPage:
      await MangaNavigationHandler.handleNavigationInteraction(ctx);
      break;

    case InteractionType.Search_SelectManga:
      const mangadexId = InteractionIdSerializer.decodeSearchSelect(id);

      ctx.editParent(
        await MangaNavigationHandler.getNewMessageContents({
          interactionType: InteractionType.Manga_Open,
          identifier: {
            platform: "mangadex",
            series: mangadexId,
          },
          chapter: null,
          page: null,
        })
      );
      break;

    case InteractionType.Search_BackPage:
    case InteractionType.Search_ForwardPage:
      await SearchHandler.handleNavigationInteraction(ctx);
      break;

    case InteractionType.Debug_SwitchPage:
      ctx.editParent(
        await DebugCommandHandler.run(
          InteractionIdSerializer.decodeDebugSwitchPage(id),
          ctx.user.id
        )
      );
      break;

    case InteractionType.Debug_ClearCache:
      await DebugCommandHandler.clearCache();

      ctx.editParent(
        await DebugCommandHandler.run(
          {
            interactionType: InteractionType.Debug_SwitchPage,
            page: DebugPageType.Cache,
          },
          ctx.user.id
        )
      );
      break;

    case InteractionType.Close:
      ctx.message.delete();
      break;

    default:
      break;
  }
}
