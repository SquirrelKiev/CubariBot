export const config = {
  cubariUrl: "https://cubari.moe",
  defaultManga: "https://mangasee123.com/manga/Oshi-no-Ko",
  defaultPage: 1,
  customPlatformHandling: [
    {
      platform: "mangadex",
      proxyImages: true,
    },
  ],
  proxyUrl: "https://kievscubaribot.azurewebsites.net/api/image.jpg?url=",
  imageProxy: {
    maxImageSize: 1024 * 1024 * 50, // 50 MB
    timeout: 5000,
    whitelistedDomains: ["uploads.mangadex.org"],
  },

  shouldProxyImages(platform: string): boolean {
    for (const customPlatform of this.customPlatformHandling) {
      if (customPlatform.platform === platform && customPlatform.proxyImages) {
        return true;
      }
    }
    return false;
  },
};
