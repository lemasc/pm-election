import { useRouter } from "next/router";
import Wizard from "@/components/wizard";
import Profile from "@/components/profile";
import { useAuth } from "@/shared/authContext";
import { ConfigPageProps, withConfig } from "@/shared/api/config";

export const getServerSideProps = withConfig();

export default function ProfilePage({ config }: ConfigPageProps) {
  const { profile: props, signOut, votes, ready } = useAuth();
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
        {props && ready && votes !== undefined && (
          <>
            <h2 className="text-2xl">
              {votes ? "ข้อมูลการลงคะแนน" : "ตรวจสอบข้อมูลก่อนการลงคะแนน"}
            </h2>
            <Profile {...{ ...props, votes }} />
            <span className="text-red-500 font-bold sarabun-font">
              {votes ? (
                <>คุณได้ลงคะแนนเลือกผู้สมัครรับเลือกตั้งในระบบแล้ว</>
              ) : !config.inTime ? (
                <>
                  คุณอยู่นอกระยะเวลาการลงคะแนน
                  <br />
                  <span className="text-sm py-1 font-light">
                    ระยะเวลาที่สามารถลงคะแนนได้คือ 8 ก.ย. 2564 เวลา 08:30-17:00 น.
                  </span>
                  <br />
                </>
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
                  router.replace(!votes && config.inTime ? "/login" : "/api/logout");
                }}
                className="px-4 py-2 btn bg-gray-200 from-gray-200 to-gray-300 ring-gray-300"
              >
                ออกจากระบบ
              </button>
              {!votes && config.inTime && (
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
