import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { SSRContext, withSession } from "@/shared/api";
import { LoginResult } from "@/types/login";
import Wizard from "@/components/wizard";
import Profile from "@/components/profile";
import { useAuth } from "@/shared/authContext";
import { useRouter } from "next/router";

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
  const { signOut } = useAuth();
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Wizard>
        <h2 className="text-2xl">ลงคะแนนเรียบร้อยแล้ว!</h2>
        <Profile {...props} />

        <b className="font-bold text-apple-600">
          กรุณาบันทึกภาพหน้าจอไว้เป็นหลักฐานในการลงคะแนน
        </b>
        <button
          onClick={() => {
            signOut();
            router.replace("/api/logout");
          }}
          className="px-4 py-2 btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 text-white"
        >
          ออกจากระบบ
        </button>
      </Wizard>
    </div>
  );
}
