import { config } from "../Config";

var chapterCache: Record<string, string[]> = {};

export interface ChapterState {
  newChapter: string;
  newPage: number;
}

export interface SeriesIdentifier {
  platform: string;
  series: string;
}


export class Manga {
  identifier: SeriesIdentifier;
  title: string;
  description: string;
  author: string;
  artist: string;
  groups: Record<string, string>;
  cover: string;
  chapters: Record<string, Chapter>;
  series_name: string;

  constructor(json: string, platform: string) {
    let data: any = JSON.parse(json);

    this.identifier = { platform, series: data.slug }
    this.title = data.title;
    this.description = data.description;
    this.author = data.author;
    this.artist = data.artist;
    this.groups = data.groups;
    this.cover = data.cover;
    this.series_name = data.series_name;

    this.chapters = Object.entries(data.chapters).reduce(
      (chapters, [key, value]) => {
        chapters[key] = new Chapter(value);
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
    let chapterKeys: string[] = Object.keys(this.chapters);

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
      ).length;

      if (skipToEnd) {
        newPage = totalChapterPages;
        break;
      } else if (newPage < 1) {
        setChapterIndex(chapterIndex - 1);
        newPage += (
          await this.chapters[chapterKeys[chapterIndex]].getImageSrcs(
            getCacheKey(this.identifier, chapterKeys[chapterIndex])
          )
        ).length;
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
}

export class Chapter {
  volume: string | null;
  title: string;
  groups: Record<string, string | string[] | Image[]>;
  release_date?: Record<string, number>;
  last_updated?: number;

  constructor(data: any) {
    this.volume = data.volume;
    this.title = data.title;
    this.groups = data.groups;
    this.release_date = data.release_date;
    this.last_updated = data.last_updated;
  }

  async getImageSrcs(cacheKey: string): Promise<string[]> {
    if (cacheKey in chapterCache) {
      return chapterCache[cacheKey];
    }

    let groupKeys = Object.keys(this.groups);

    let srcs: string[] = [];

    for (let x of groupKeys) {
      let group = this.groups[x];

      srcs = await this.getImageSrcFromGroup(group, srcs);
    }

    chapterCache[cacheKey] = srcs;

    return srcs;
  }

  async getImageSrcFromGroup(
    group: string | string[] | Image[],
    srcs: string[]
  ): Promise<string[]> {
    if (typeof group === "string") {
      let req = await fetch(config.cubariUrl + group);
      srcs = await this.getImageSrcFromGroup(await req.json(), srcs);
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
