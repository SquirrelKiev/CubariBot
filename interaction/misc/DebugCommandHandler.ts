import {
  ButtonStyle,
  ComponentType,
  EmbedField,
  MessageOptions,
} from "slash-create";
import { instanceId, timeStarted } from "./MiscUtility";
import { config } from "../Config";
import {
  DebugPageType,
  DebugSwitchPageState,
  InteractionIdSerializer,
  InteractionType,
} from "./InteractionIdSerializer";
import CacheManager from "./CacheManager";

export class DebugCommandHandler {
  static async clearCache() {
    CacheManager.caches.clear();
  }
  public static async run(
    state: DebugSwitchPageState,
    userId: string
  ): Promise<MessageOptions> {
    if (!config.getBotOwners().includes(userId)) {
      return {
        content: "No permission.",
      };
    }

    switch (state.page) {
      case DebugPageType.Main:
        return {
          embeds: [
            {
              color: config.embedColor,
              fields: [
                {
                  name: "Instance Started",
                  value: `<t:${timeStarted}:R>`,
                  inline: true,
                },
                {
                  name: "Instance ID",
                  value: `\`${instanceId}\``,
                  inline: true,
                },
                {
                  name: "Memory Usage",
                  value: `\`${Math.round(
                    process.memoryUsage().rss / 1000000
                  )} MB\``,
                  inline: true,
                },
              ],
            },
          ],
          components: [
            {
              type: ComponentType.ACTION_ROW,
              components: [
                {
                  type: ComponentType.BUTTON,
                  style: config.defaultButtonStyle,
                  label: "Cache",
                  custom_id: InteractionIdSerializer.encodeDebugSwitchPage({
                    interactionType: InteractionType.Debug_SwitchPage,
                    page: DebugPageType.Cache,
                  }),
                },
                {
                  type: ComponentType.BUTTON,
                  style: config.defaultButtonStyle,
                  label: "↺",
                  custom_id: InteractionIdSerializer.encodeDebugSwitchPage({
                    interactionType: InteractionType.Debug_SwitchPage,
                    page: DebugPageType.Main,
                  }),
                },
                {
                  type: ComponentType.BUTTON,
                  style: ButtonStyle.DESTRUCTIVE,
                  label: "X",
                  custom_id: `${InteractionType.Close}`,
                },
              ],
            },
          ],
        };

      case DebugPageType.Cache:
        let fields: EmbedField[] = [];

        CacheManager.caches.forEach((element) => {
          fields.push({
            name: element.namespace,
            value: `${element.cache.size}/${element.cache.max} element(s)`,
            inline: true,
          });
        });

        return {
          embeds: [
            {
              color: config.embedColor,
              title: `Current Cache Groups: ${CacheManager.caches.size}`,
              fields: fields,
            },
          ],
          components: [
            {
              type: ComponentType.ACTION_ROW,
              components: [
                {
                  type: ComponentType.BUTTON,
                  style: config.defaultButtonStyle,
                  label: "<--",
                  custom_id: InteractionIdSerializer.encodeDebugSwitchPage({
                    interactionType: InteractionType.Debug_SwitchPage,
                    page: DebugPageType.Main,
                  }),
                },
                {
                  type: ComponentType.BUTTON,
                  style: config.defaultButtonStyle,
                  label: "↺",
                  custom_id: InteractionIdSerializer.encodeDebugSwitchPage({
                    interactionType: InteractionType.Debug_SwitchPage,
                    page: DebugPageType.Cache,
                  }),
                },
                {
                  type: ComponentType.BUTTON,
                  style: ButtonStyle.DESTRUCTIVE,
                  label: "X",
                  custom_id: `${InteractionType.Close}`,
                },
              ],
            },
            {
              type: ComponentType.ACTION_ROW,
              components: [
                {
                  type: ComponentType.BUTTON,
                  style: ButtonStyle.DESTRUCTIVE,
                  label: "Clear",
                  custom_id: `${InteractionType.Debug_ClearCache}`,
                },
              ],
            },
          ],
        };
    }
  }
}
