import { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";

import { Candidate, CandidateDatabase } from "@/shared/candidates";
import Layout from "@/components/layout";
import CandidateList from "@/components/list";
import Instructions from "@/components/instructions";
import QuestionSection from "@/components/question";

export const getStaticProps: GetStaticProps<{
  candidates: Candidate[];
}> = async () => {
  try {
    const db = new CandidateDatabase();
    const candidates = await db.getCandidates(true);
    return { props: { candidates } };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

export default function CandidatesPage({
  candidates: data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>ข้อมูลการเลือกตั้ง : WPM Election System</title>
      </Head>
      <Layout>
        <h1 className="text-3xl font-bold">ข้อมูลการเลือกตั้ง</h1>
        <div className="space-y-2 flex flex-col">
          <h2 className="text-xl underline">ผู้ลงสมัครประธานนักเรียน</h2>
          <span className="text-sm text-gray-500">คลิกเพื่อดูข้อมูลของผู้ลงสมัครที่ต้องการ</span>
        </div>
        <div className="sm:bg-white sm:p-8 sm:py-auto py-0 sm:rounded sm:shadow">
          <CandidateList data={data} />
        </div>
        <h2 className="text-xl underline">Q&amp;A ระบบการลงคะแนน</h2>
        <div className="bg-white sm:px-8 py-8 rounded shadow">
          <QuestionSection />
        </div>
        <h2 className="text-xl underline">ขั้นตอนการลงคะแนน</h2>
        <Instructions />
      </Layout>
    </div>
  );
}
