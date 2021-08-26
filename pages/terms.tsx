import { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

import HeaderComponent from "@/components/layout/header";
import MarkDownComponent from "@/components/markdown";

export const getStaticProps: GetStaticProps = async () => {
  const content = await fs.readFile(
    path.join(process.cwd(), "/docs/terms.md"),
    {
      encoding: "utf-8",
    }
  );
  return {
    props: {
      content,
    },
  };
};

export default function TermsPage({
  content,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
  return (
    <div className="circle min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>ข้อกำหนดในการใช้งาน : WPM Election System</title>
      </Head>

      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent />
        <div className="md:mx-24 mx-8 p-4 break-words">
          <MarkDownComponent content={content} />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 dark:text-white flex justify-center items-center w-full p-8 border-t gap-8">
        <Link href="/">
          <a className="text-sm underline">กลับไปยังหน้าหลัก</a>
        </Link>
        <Link href="/terms">
          <a className="text-sm underline">ข้อกำหนดในการใช้งาน</a>
        </Link>
        <Link href="/privacy">
          <a className="text-sm underline">นโยบายความเป็นส่วนตัว</a>
        </Link>
      </footer>
    </div>
  );
}
