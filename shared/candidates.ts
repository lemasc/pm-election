import axios from "axios";
import { promises as fs, constants } from "fs";
import { IncomingMessage } from "http";
import path from "path";

export type CandidateWithContent = {
  index?: number;
  title: string;
  name: string;
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
  private server: boolean;
  private serverUrl: string = "";
  /**
   * Candidate database used in both SSG and SSR.
   * In SSG, data will be readed directly from the filesystem and the indexes will be created.
   * In SSR, uses the indexes created from SSG and fetch using HTTP.
   */
  constructor(req?: IncomingMessage) {
    if (req) {
      this.server = true;
      this.serverUrl =
        (req.headers.host?.includes("localhost") ? "http" : "https") +
        "://" +
        req.headers.host;
    } else {
      this.server = false;
    }
  }
  getBasePath() {
    return path.join(process.cwd(), "public");
  }
  async getFile(...file: string[]): Promise<string> {
    try {
      if (this.server) {
        let _file = await axios
          .get("/" + path.join("candidates", ...file), {
            responseType: "text",
            baseURL: this.serverUrl,
            transformResponse: [],
          })
          .then((d) => d.data);
        return _file;
      }
      return await fs.readFile(
        path.join(this.getBasePath(), "candidates", ...file),
        {
          encoding: "utf-8",
        }
      );
    } catch (err) {
      console.error(err);
      return "";
    }
  }
  async getFolders(): Promise<string[]> {
    try {
      if (this.server) {
        const folders = await this.getFile("index.json");
        return JSON.parse(folders);
      } else {
        const folders = (
          await fs.readdir(path.join(this.getBasePath(), "candidates"))
        ).filter((c) => c != "index.json");
        const indexFile = path.join(
          this.getBasePath(),
          "candidates",
          "index.json"
        );
        if (fs.access(indexFile, constants.W_OK)) {
          await fs.writeFile(indexFile, JSON.stringify(folders), {
            encoding: "utf-8",
          });
        }
        return folders;
      }
    } catch (err) {
      return [];
    }
  }
  async getCandidates(
    noContent?: boolean
  ): Promise<Candidate[] | CandidateWithContent[]> {
    try {
      const folders = await this.getFolders();
      return (
        await Promise.all(
          folders.map(
            async (folder) => await this.getCandidate(folder, noContent)
          )
        )
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
