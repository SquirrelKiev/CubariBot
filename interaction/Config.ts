export const config = {
  cubariUrl: "https://cubari.moe",
  defaultManga: "mangasee/Oshi-no-Ko",
  customPlatformHandling: [
    {
      platform: "mangadex",
      proxyImages: true,
    },
  ],
  proxyUrl: process.env.PROXY_URL,
  mangadexPaginationLimit: 5,

  // db
  dbName: "prefs",
  guildPrefsCol: "guild-prefs",
  channelPrefsCol: "channel-prefs",
  userPrefsCol: "user-prefs",

  shouldProxyImages(platform: string): boolean {
    for (const customPlatform of this.customPlatformHandling) {
      if (customPlatform.platform === platform && customPlatform.proxyImages) {
        return true;
      }
    }
    return false;
  },
};
