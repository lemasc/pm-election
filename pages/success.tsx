import Wizard from "@/components/wizard";
import Profile from "@/components/profile";
import { useAuth } from "@/shared/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SuccessPage() {
  const { signOut, profile, votes: props, ready } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (ready && !(props && props.selected)) {
      router.replace("/");
    }
  }, [router, props, ready]);
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Wizard>
        <h2 className="text-2xl">ลงคะแนนเรียบร้อยแล้ว!</h2>
        {props && profile && <Profile {...profile} votes={props} />}

        <b className="font-bold text-apple-600">กรุณาบันทึกภาพหน้าจอไว้เป็นหลักฐานในการลงคะแนน</b>
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
