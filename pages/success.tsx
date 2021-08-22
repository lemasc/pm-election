import { GetServerSideProps, GetServerSidePropsResult } from "next";
import Link from "next/link";

import { SSRContext, withSession } from "@/shared/api";
import { LoginResult } from "@/types/login";
import Wizard from "@/components/wizard";
import Profile from "@/components/profile";

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

export default function SuccessPage(props: LoginResult) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Wizard>
        <h2 className="text-2xl">ลงคะแนนเรียบร้อยแล้ว!</h2>
        <Profile {...props} />

        <b className="font-bold text-apple-600">
          กรุณาบันทึกภาพหน้าจอไว้เป็นหลักฐานในการลงคะแนน
        </b>
        <Link href="/api/logout">
          <a className="px-4 py-2 btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 text-white">
            ออกจากระบบ
          </a>
        </Link>
      </Wizard>
    </div>
  );
}
