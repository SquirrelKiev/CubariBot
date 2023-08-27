export interface CubariMangaSchema {
    slug: string;
    title: string;
    description: string;
    author: string;
    artist: string;
    groups: Record<string, string>;
    cover: string;
    chapters: Record<string, CubariChapterSchema>;
    series_name: string;
}

export interface CubariChapterSchema {
    volume: string | null;
    title: string;
    groups: Record<string, CubariChapterGroup>;
    release_date?: Record<string, number>;
    last_updated: number;
}

export interface Image {
    description: string;
    src: string;
}

export type CubariChapterGroup = string | string[] | Image[];