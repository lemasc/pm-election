import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";

import { SSRContext, withSession } from "@/shared/api";
import { LoginResult } from "./api/login";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Layout from "@/components/layout";

export const getServerSideProps: GetServerSideProps = withSession<LoginResult>(
  async (
    context: SSRContext
  ): Promise<GetServerSidePropsResult<LoginResult>> => {
    const data: LoginResult | undefined = context.req.session.get("profile");
    if (!data) {
      context.req.session.destroy();
      await context.req.session.save();
      return {
        redirect: {
          destination: "/",
          permanent: true,
        },
      };
    }
    return {
      props: {
        ...data,
        stdName: data.stdName.replace("   ", ""),
      },
    };
  }
);

export default function Profile(props: LoginResult) {
  const router = useRouter();

  async function next() {
    try {
      router.push("/select");
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>ตรวจสอบข้อมูล : WPM Election System</title>
      </Head>
      <Header step={2} desc="ตรวจสอบข้อมูล" />
      <Layout>
        <h2 className="text-2xl font-bold">
          {props.votes ? "ข้อมูลการลงคะแนน" : "ตรวจสอบข้อมูลก่อนการลงคะแนน"}
        </h2>
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
          <b>สถานะ: </b>
          <span
            className={
              "font-bold " + (!props.votes ? "text-red-500" : "text-green-700")
            }
          >
            {!props.votes ? "ยังไม่ได้ลงคะแนน" : "ลงคะแนนแล้ว"}
          </span>
          {props.votes && (
            <>
              <b>ผู้สมัครที่ลงคะแนน:</b>
              <span>
                {props.votes.name} (เบอร์ {props.votes.selected})
              </span>
            </>
          )}
        </div>
        <span className="text-red-500 font-bold">
          {props.votes ? (
            <>ท่านได้ดำเนินการลงคะแนนแล้ว ไม่สามารถลงคะแนนเพิ่มได้อีก</>
          ) : (
            <>
              หากข้อมูลส่วนใดไม่ถูกต้อง กรุณายกเลิกการลงทะเบียน
              และแจ้งคณะกรรมการนักเรียนเพื่อดำเนินการแก้ไขให้ถูกต้อง
            </>
          )}
        </span>
        <div className="flex flex-row gap-4">
          <Link href="/login">
            <a className="px-4 py-2 btn bg-gray-200 from-gray-200 to-gray-300 ring-gray-300 font-bold">
              ออกจากระบบ
            </a>
          </Link>
          {!props.votes && (
            <button
              onClick={() => next()}
              className="px-4 py-2 btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 font-bold text-white"
            >
              ดำเนินการต่อ
            </button>
          )}
        </div>
      </Layout>

      <Footer />
    </div>
  );
}
