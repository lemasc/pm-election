import { GetServerSideProps, GetServerSidePropsResult } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { SSRContext, withSession } from "@/shared/api";
import { LoginResult } from "./api/login";
import Header from "@/components/header";
import Layout from "@/components/layout";

export const getServerSideProps: GetServerSideProps = withSession<LoginResult>(
  async (
    context: SSRContext
  ): Promise<GetServerSidePropsResult<LoginResult>> => {
    const data: LoginResult | undefined = context.req.session.get("profile");
    context.req.session.destroy();
    await context.req.session.save();
    if (!data || !data.votes) {
      return {
        redirect: {
          destination: "/",
          permanent: true,
        },
      };
    }
    return {
      props: data,
    };
  }
);

export default function Profile(props: LoginResult) {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>สำเร็จ : WPM Election System</title>
      </Head>
      <Header step={4} desc="ลงคะแนนสำเร็จ" />
      <Layout>
        <h2 className="text-2xl font-bold">ลงคะแนนเรียบร้อยแล้ว!</h2>
        <div className="p-8 bg-gray-200 grid grid-cols-2 rounded max-w-3xl text-left gap-2">
          <b>ภาคเรียนที่:</b>
          <span>{props.term}</span>
          <b>เลขประจำตัว:</b>
          <span>{props.stdID}</span>
          <b>ชื่อ:</b>
          <span>{props.stdName}</span>
          <b>ชั้น:</b>
          <span>{props.stdClass}</span>
          <b>เลขที่: </b>
          <span>{props.stdNo}</span>
          {props.votes && (
            <>
              <b>ผู้สมัครที่ลงคะแนน:</b>
              <span>
                {props.votes.name} (เบอร์ {props.votes.selected})
              </span>
            </>
          )}
        </div>

        <span className="text-apple-700">
          <b>กรุณาบันทึกภาพหน้าจอไว้เป็นหลักฐานในการลงคะแนน</b>
        </span>
        <Link href="/api/logout">
          <a className="px-4 py-2 btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 font-bold text-white">
            ออกจากระบบ
          </a>
        </Link>
      </Layout>
    </div>
  );
}
