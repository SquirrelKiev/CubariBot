import axios from "axios";
import { config } from "../Config";
import { CubariChapterGroup, CubariChapterSchema, CubariMangaSchema } from "../misc/CubariSchema";

var chapterCache: Record<string, ChapterSrcs> = {};

export interface ChapterState {
  newChapter: string;
  newPage: number;
}

export interface SeriesIdentifier {
  platform: string;
  series: string;
}

export interface ChapterSrcs {
  srcs: string[];
  groupKey: string;
}

export class Manga {
  getCubariUrl(chapter: string, page: number): string {
    return `${config.cubariUrl}/read/${encodeURIComponent(
      this.identifier.platform
    )}/${encodeURIComponent(this.identifier.series)}/${chapter}/${page}`;
  }
  identifier: SeriesIdentifier;
  title: string;
  description: string;
  author: string;
  artist: string;
  groups: Record<string, string>;
  cover: string;
  chapters: Record<string, Chapter>;
  series_name: string;

  constructor(data: CubariMangaSchema, platform: string) {
    this.identifier = { platform, series: data.slug };
    this.title = data.title;
    this.description = data.description;
    this.author = data.author;
    this.artist = data.artist;
    this.groups = data.groups;
    this.cover = data.cover;
    this.series_name = data.series_name;

    this.chapters = Object.entries(data.chapters).reduce(
      (chapters, [key, value]) => {
        chapters[key] = new Chapter(value, key);
        return chapters;
      },
      {} as Record<string, Chapter>
    );
  }

  async navigate(
    currentChapter: string,
    currentPage: number,
    deltaChapters: number,
    deltaPages: number
  ): Promise<ChapterState> {
    let chapterKeys = this.getSortedChapterKeys();

    let chapterIndex = chapterKeys.findIndex(
      (chapter) => chapter === currentChapter
    );
    let newPage = currentPage + deltaPages;
    let skipToEnd: boolean = false;

    function setChapterIndex(newValue: number) {
      if (newValue < 0) {
        chapterIndex = 0;
        newPage = 1;
      } else if (newValue > chapterKeys.length - 1) {
        chapterIndex = chapterKeys.length - 1;
        skipToEnd = true;
      } else {
        chapterIndex = newValue;
      }
    }

    if (deltaChapters !== 0) {
      setChapterIndex(chapterIndex + deltaChapters);
      newPage = 1;
    }

    while (true) {
      let totalChapterPages = (
        await this.chapters[chapterKeys[chapterIndex]].getImageSrcs(
          getCacheKey(this.identifier, chapterKeys[chapterIndex])
        )
      ).srcs.length;

      if (skipToEnd) {
        newPage = totalChapterPages;
        break;
      } else if (newPage < 1) {
        setChapterIndex(chapterIndex - 1);
        newPage += (
          await this.chapters[chapterKeys[chapterIndex]].getImageSrcs(
            getCacheKey(this.identifier, chapterKeys[chapterIndex])
          )
        ).srcs.length;
      } else if (newPage > totalChapterPages) {
        setChapterIndex(chapterIndex + 1);
        newPage -= totalChapterPages;
      } else {
        break;
      }
    }

    return {
      newChapter: chapterKeys[chapterIndex],
      newPage: newPage,
    };
  }

  getSortedChapterKeys() {
    const chapterKeysUnsorted: string[] = Object.keys(this.chapters).sort();

    let numbers = chapterKeysUnsorted.filter(
      (item) => !isNaN(parseFloat(item))
    );
    // not sure if this crops up but im not taking any chances
    const nonNumbers = chapterKeysUnsorted.filter((item) =>
      isNaN(parseFloat(item))
    );

    numbers.sort((a, b) => parseFloat(a) - parseFloat(b));
    nonNumbers.sort();

    const chapterKeys = [...numbers, ...nonNumbers];
    return chapterKeys;
  }
}

export class Chapter {
  volume: string | null;
  title: string;
  slug: string;
  groups: Record<string, CubariChapterGroup>;
  release_date?: Record<string, number>;
  last_updated?: number;

  constructor(data: CubariChapterSchema, slug: string) {
    this.volume = data.volume;
    this.title = data.title;
    this.slug = slug;
    this.groups = data.groups;
    this.release_date = data.release_date;
    this.last_updated = data.last_updated;
  }

  async getImageSrcs(cacheKey: string): Promise<ChapterSrcs> {
    if (cacheKey in chapterCache) {
      return chapterCache[cacheKey];
    }

    const groupKeys = Object.keys(this.groups);

    const group = this.groups[groupKeys[0]];

    const srcs = await this.getImageSrcFromGroup(group);

    const result: ChapterSrcs = {
      srcs,
      groupKey: groupKeys[0]
    }

    chapterCache[cacheKey] = result;

    return result;
  }

  async getImageSrcFromGroup(
    group: CubariChapterGroup
  ): Promise<string[]> {
    let srcs: string[] = [];

    if (typeof group === "string") {
      let req = await axios.get(config.cubariUrl + group, {
        headers: {
          "User-Agent": config.userAgent,
        },
      });
      srcs = (await this.getImageSrcFromGroup(await req.data));
    } else if (isStringArray(group)) {
      srcs = srcs.concat(group as string[]);
    } else {
      // can assume we're an image array
      group = group as Image[];

      group.forEach((x: Image) => {
        srcs.push(x.src);
      });
    }

    return srcs;
  }
}

export function getCacheKey(
  identifier: SeriesIdentifier,
  chapter: string
): string {
  return identifier.platform + identifier.series + chapter;
}

export interface Image {
  description: string;
  src: string;
}
function isStringArray(potentialArray: any[]): boolean {
  if (Array.isArray(potentialArray) === false) return false;

  let nonString = false;

  potentialArray.forEach((x) => {
    if (typeof x !== "string") {
      nonString = true;
      return;
    }
  });

  return !nonString;
}
