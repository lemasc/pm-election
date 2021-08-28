import { promises as fs } from "fs";
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

/**
 * From the current issue, API routes could not access the filesystem.
 * On production at vercel this will fails the whole thing.
 * For now, use the copy-webpack-plugin to copy files to the lambda-accessible dir.
 *
 * See https://github.com/vercel/next.js/issues/8251#issuecomment-854148718
 */

let isNetlify = false;
function getBasePath() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NETLIFY === undefined &&
    !isNetlify
  ) {
    return path.join(process.cwd(), ".next/server/chunks");
  }
  return process.cwd();
}

async function getFile(...file: string[]): Promise<string> {
  try {
    return await fs.readFile(path.join(getBasePath(), "candidates", ...file), {
      encoding: "utf-8",
    });
  } catch (err) {
    console.error(err);
    return "";
  }
}
export async function getCandidate(
  index: string,
  noContent?: boolean
): Promise<Candidate | CandidateWithContent | null> {
  try {
    const file = await getFile(index, `index.json`);
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
        return [v, await getFile(index, `${v}.md`)];
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

export async function getCandidates(
  noContent?: boolean
): Promise<Candidate[] | CandidateWithContent[]> {
  try {
    const folders = await getFolders();
    console.log(folders);
    return (
      await Promise.all(
        folders.map(async (folder) => await getCandidate(folder, noContent))
      )
    ).filter((c) => c !== null) as Candidate[];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getFolders(): Promise<string[]> {
  try {
    return (await fs.readdir(path.join(getBasePath(), "candidates"))).filter(
      (c) => c != "index.ts"
    );
  } catch (err) {
    console.error(err);
    if (!isNetlify) {
      isNetlify = true;
      return getFolders();
    }
    return [];
  }
}
