import { Db, MongoClient } from "mongodb";
import { ChannelPrefs, GuildPrefs, Prefs, UserPrefs } from "./DbTypes";

export class DbManager {
  private static instance: DbManager;

  private client: MongoClient;
  private db: Db;

  public static getInstance(): DbManager {
    if (!this.instance) {
      this.instance = new DbManager();
      this.instance.client = new MongoClient(
        process.env.MONGODB_CONNECTION_STRING
      );
      this.instance.db = this.instance.client.db("prefs");
    }
    return this.instance;
  }

  public async getGuildPrefs(id: string) {
    return this.getPrefs<GuildPrefs>(
      id,
      "guild-prefs",
      (partial) => new GuildPrefs(partial)
    );
  }

  public async getChannelPrefs(id: string) {
    return this.getPrefs<ChannelPrefs>(
      id,
      "channel-prefs",
      (partial) => new ChannelPrefs(partial)
    );
  }

  public async getUserPrefs(id: string) {
    return this.getPrefs<UserPrefs>(
      id,
      "user-prefs",
      (partial) => new UserPrefs(partial)
    );
  }

  public async setGuildPrefs(id: string, partial: Partial<GuildPrefs>) {
    return this.setPrefs(id, "guild-prefs", partial);
  }
  public async setChannelPrefs(id: string, partial: Partial<ChannelPrefs>) {
    return this.setPrefs(id, "channel-prefs", partial);
  }
  public async setUserPrefs(id: string, partial: Partial<UserPrefs>) {
    return this.setPrefs(id, "user-prefs", partial);
  }

  public async getDefaultManga(
    guildId: string,
    channelId: string,
    userId: string
  ): Promise<string> {
    const userPrefs = await this.getUserPrefs(userId);

    if (userPrefs.defaultManga) {
      return userPrefs.defaultManga;
    }

    const channelPrefs = await this.getChannelPrefs(channelId);

    if (channelPrefs.defaultManga) {
      return channelPrefs.defaultManga;
    }

    const guildPrefs = await this.getGuildPrefs(guildId);
    return guildPrefs.defaultManga;
  }

  private async setPrefs<T extends Prefs>(
    guildId: string,
    collectionName: string,
    pref: Partial<T>
  ): Promise<void> {
    const collection = this.db.collection(collectionName);

    await collection.updateOne(
      { id: guildId },
      { $set: pref },
      { upsert: true }
    );
  }

  private async getPrefs<T extends Prefs>(
    id: string,
    collectionName: string,
    factory: (partial: Partial<T>) => T
  ): Promise<T> {
    const collection = this.db.collection(collectionName);
    const prefsDocument = await collection.findOne({ id: id });

    let prefs: T;

    if (!prefsDocument) {
      prefs = factory({ id } as Partial<T>);
      // await this.setPrefs(id, collectionName, prefs); // sounds costly
    } else {
      // shh linter be quiet
      prefs = factory(prefsDocument as unknown as Partial<T>);
    }

    return prefs;
  }
}
