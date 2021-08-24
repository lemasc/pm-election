import Link from "next/link";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";

import { SSRContext, withSession } from "@/shared/api";
import Wizard from "@/components/wizard";
import Profile from "@/components/profile";
import { LoginResult } from "@/types/login";

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
        stdName: data.stdName,
      },
    };
  }
);

export default function ProfilePage(props: LoginResult) {
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
      <Wizard>
        <h2 className="text-2xl">
          {props.votes ? "ข้อมูลการลงคะแนน" : "ตรวจสอบข้อมูลก่อนการลงคะแนน"}
        </h2>
        <Profile {...props} />
        <span className="text-red-500 font-bold sarabun-font">
          {props.votes ? (
            <>ท่านได้เลือกผู้สมัครลงคะแนนในระบบแล้ว</>
          ) : (
            <>
              หากข้อมูลส่วนใดไม่ถูกต้อง กรุณายกเลิกการลงคะแนน
              และแจ้งคณะกรรมการนักเรียนเพื่อดำเนินการแก้ไขให้ถูกต้อง
            </>
          )}
        </span>
        <div className="flex flex-row gap-4">
          <Link href={props.votes ? "/api/logout" : "/login"}>
            <a className="px-4 py-2 btn bg-gray-200 from-gray-200 to-gray-300 ring-gray-300">
              ออกจากระบบ
            </a>
          </Link>
          {!props.votes && (
            <button
              onClick={() => next()}
              className="px-4 py-2 btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 text-white"
            >
              ดำเนินการต่อ
            </button>
          )}
        </div>
      </Wizard>
    </div>
  );
}
