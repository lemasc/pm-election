import axios from "axios";
import { promises as fs, constants } from "fs";
import { IncomingMessage } from "http";
import path from "path";

export type CandidateWithContent = {
  index?: number;
  title: string;
  name: string;
  nickname: string;
  surname: string;
  class: string;
  education: Record<string, number>;
  abilities: string[];
  motto: string;
  experience?: string;
  policy?: string;
};

export type Candidate = Pick<
  CandidateWithContent,
  "index" | "title" | "name" | "surname" | "class"
>;

export class CandidateDatabase {
  private indexFile = "path.json";
  private location = "data";
  private server: boolean;
  private serverUrl: string = "";
  /**
   * The candidate database instance used in both SSG and SSR.
   *
   * In SSG, data will be readed directly from the file-system and the indexes are created.
   * In SSR, uses the indexes created from SSG and fetch using HTTP.
   *
   */
  constructor(req?: IncomingMessage) {
    if (req) {
      this.server = true;
      this.serverUrl =
        (req.headers.host?.includes("localhost") ? "http" : "https") + "://" + req.headers.host;
    } else {
      this.server = false;
    }
  }
  private getDataPath() {
    return path.join(process.cwd(), "public", this.location);
  }
  private async getFile(...file: string[]): Promise<string> {
    try {
      if (this.server) {
        let _file = await axios
          .get("/" + path.join(this.location, ...file), {
            responseType: "text",
            baseURL: this.serverUrl,
            // Axios parse JSON automatically, but for this we don't want this so.
            // See https://stackoverflow.com/a/41015885
            transformResponse: [],
          })
          .then((d) => d.data);
        return _file;
      }
      return await fs.readFile(path.join(this.getDataPath(), ...file), {
        encoding: "utf-8",
      });
    } catch (err) {
      console.error(err);
      return "";
    }
  }
  async needsReindex(indexFile: string): Promise<boolean> {
    // Always reindex on development.
    if (process.env.NODE_ENV == "development") return true;
    try {
      // If file exists, no need to reindex.
      await fs.access(indexFile, constants.R_OK);
      return false;
    } catch (err) {
      // If file not exists, reindex anyway.
      if (err.code == "ENOENT") return true;
      return false;
    }
  }
  async getFolders(): Promise<string[]> {
    try {
      if (this.server) {
        const folders = await this.getFile(this.indexFile);
        // In production, functions have no access to the file-system. Return as is.
        // See https://github.com/vercel/next.js/issues/8251
        if (process.env.NODE_ENV == "production") return JSON.parse(folders);
      }
      const folders = (await fs.readdir(this.getDataPath())).filter((c) => c != this.indexFile);
      const indexFile = path.join(this.getDataPath(), this.indexFile);
      if (await this.needsReindex(indexFile)) {
        // Well, we don't need to write this everytime the users browse.
        // Just create if it doesn't exists then.
        await fs.writeFile(indexFile, JSON.stringify(folders), {
          encoding: "utf-8",
        });
      }
      return folders;
    } catch (err) {
      return [];
    }
  }
  async getCandidates(noContent?: boolean): Promise<Candidate[] | CandidateWithContent[]> {
    try {
      const folders = await this.getFolders();
      return (
        await Promise.all(folders.map(async (folder) => await this.getCandidate(folder, noContent)))
      ).filter((c) => c !== null) as Candidate[];
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  async getCandidate(
    index: string,
    noContent?: boolean
  ): Promise<Candidate | CandidateWithContent | null> {
    try {
      const file = await this.getFile(index, `index.json`);
      if (!file) return null;
      const data = JSON.parse(file) as CandidateWithContent;
      if (noContent) {
        return {
          index: parseInt(index),
          name: data.name,
          title: data.title,
          surname: data.surname,
          class: data.class,
        } as Candidate;
      }
      const externals = await Promise.all(
        ["experience", "policy"].map(async (v) => {
          return [v, await this.getFile(index, `${v}.md`)];
        })
      );
      return {
        ...data,
        ...Object.fromEntries(externals),
        index: parseInt(index),
      } as CandidateWithContent;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
