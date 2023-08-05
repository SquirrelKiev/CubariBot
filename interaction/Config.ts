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
  proxyUrl: "https://dev-tunnel.squirrelkiev.co.uk/api/proxy.png?url=",

  shouldProxyImages(platform: string): boolean {
    for (const customPlatform of this.customPlatformHandling) {
      if (customPlatform.platform === platform && customPlatform.proxyImages) {
        return true;
      }
    }
    return false;
  },
};
