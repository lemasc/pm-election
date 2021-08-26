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

async function getFile(...file: string[]): Promise<string> {
  try {
    return await fs.readFile(path.join(process.cwd(), "candidates", ...file), {
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
    const data = JSON.parse(await getFile(index, `index.json`)) as Candidate;
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

export async function getFolders() {
  return (await fs.readdir(path.join(process.cwd(), "candidates"))).filter(
    (c) => c != "index.ts"
  );
}
