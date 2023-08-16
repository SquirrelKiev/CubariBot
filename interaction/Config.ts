export const config = {
  cubariUrl: "https://cubari.moe",
  defaultManga: "mangasee/Oshi-no-Ko",
  defaultPage: 1,
  customPlatformHandling: [
    {
      platform: "mangadex",
      proxyImages: true,
    },
  ],
  proxyUrl: process.env.PROXY_URL,
  mangadexPaginationLimit: 5,

  shouldProxyImages(platform: string): boolean {
    for (const customPlatform of this.customPlatformHandling) {
      if (customPlatform.platform === platform && customPlatform.proxyImages) {
        return true;
      }
    }
    return false;
  },
};
