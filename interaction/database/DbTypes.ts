import { config } from "../Config";

export class Prefs {
  id: string;
  defaultManga: string | null;

  constructor(partial: Partial<Prefs>) {
    this.id = partial.id;
    this.defaultManga = partial.defaultManga || null;
  }
}

export class GuildPrefs extends Prefs {
  constructor(partial: Partial<GuildPrefs>) {
    super(partial);
    this.defaultManga = partial.defaultManga || config.defaultManga;
  }
}

export class UserPrefs extends Prefs {}

export class ChannelPrefs extends Prefs {}
