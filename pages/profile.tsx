import { useRouter } from "next/router";
import Wizard from "@/components/wizard";
import Profile from "@/components/profile";
import { useAuth } from "@/shared/authContext";

export default function ProfilePage() {
  const { profile: props, signOut, votes } = useAuth();
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
        {props && (
          <>
            <h2 className="text-2xl">
              {votes ? "ข้อมูลการลงคะแนน" : "ตรวจสอบข้อมูลก่อนการลงคะแนน"}
            </h2>
            <Profile {...{ ...props, votes }} />
            <span className="text-red-500 font-bold sarabun-font">
              {votes ? (
                <>คุณได้ลงคะแนนเลือกผู้สมัครรับเลือกตั้งในระบบแล้ว</>
              ) : (
                <>
                  หากข้อมูลส่วนใดไม่ถูกต้อง กรุณายกเลิกการลงคะแนน
                  และแจ้งคณะกรรมการนักเรียนเพื่อดำเนินการแก้ไขให้ถูกต้อง
                </>
              )}
            </span>
            <div className="flex flex-row gap-4">
              <button
                onClick={async () => {
                  await signOut();
                  router.replace(votes ? "/api/logout" : "/login");
                }}
                className="px-4 py-2 btn bg-gray-200 from-gray-200 to-gray-300 ring-gray-300"
              >
                ออกจากระบบ
              </button>
              {!votes && (
                <button
                  onClick={() => next()}
                  className="px-4 py-2 btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 text-white"
                >
                  ดำเนินการต่อ
                </button>
              )}
            </div>
          </>
        )}
      </Wizard>
    </div>
  );
}
