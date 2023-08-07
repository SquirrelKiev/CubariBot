export const config = {
  cubariUrl: "https://cubari.moe",
  defaultManga: "https://mangasee123.com/manga/Oshi-no-Ko",
  defaultPage: 1,
  customPlatformHandling: [
    {
      platform: "mangadex",
      proxyImages: true,
    }
  ],
  proxyUrl: process.env.PROXY_URL,
  shouldProxyImages(platform: string): boolean {
    for (const customPlatform of this.customPlatformHandling) {
      if (customPlatform.platform === platform && customPlatform.proxyImages) {
        return true;
      }
    }
    return false;
  },
};
