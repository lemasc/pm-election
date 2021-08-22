import { useState } from "react";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";
import axios from "axios";
import { useWindowWidth } from "@react-hook/window-size";

import { SSRContext, withSession } from "@/shared/api";
import { LoginResult } from "@/types/login";
import admin from "@/shared/firebase-admin";
import ModalComponent from "@/components/modal";
import Wizard from "@/components/wizard";

type SelectProps = LoginResult & { class: number; data: CandidateData[] };
export const getServerSideProps: GetServerSideProps = withSession(
  async (
    context: SSRContext
  ): Promise<GetServerSidePropsResult<SelectProps>> => {
    const profile: LoginResult | undefined = context.req.session.get("profile");
    if (!profile) {
      context.req.session.destroy();
      await context.req.session.save();
      return {
        redirect: {
          destination: "/",
          permanent: true,
        },
      };
    }
    const candidates = await admin
      .firestore()
      .collection("candidates")
      .orderBy("order", "asc")
      .get();
    const data = (await Promise.all(
      candidates.docs.map(async (d) => ({
        id: d.id,
        ...d.data(),
      }))
    )) as unknown as CandidateData[];

    return {
      props: {
        class: parseInt(
          profile.stdClass.slice(
            profile.stdClass.indexOf(" "),
            profile.stdClass.indexOf("/")
          )
        ),
        ...profile,
        data,
      },
    };
  }
);

type CandidateData = {
  id: string;
  order: number;
  name: string;
};

type ModalState = {
  show: boolean;
  data?: CandidateData;
};

export default function SelectPage({ data, ...props }: SelectProps) {
  const router = useRouter();
  const width = useWindowWidth();
  const [modal, setModal] = useState<ModalState>({ show: false });
  const [errorText, setError] = useState<string | null>(null);
  const [fetching, setFetch] = useState(false);
  async function select() {
    if (!modal.data) return;
    try {
      setFetch(true);
      await axios.post(
        "/api/select",
        new URLSearchParams({
          id: modal.data.order.toString(),
          name: `ชื่อ นามสกุล`,
        })
      );
      router.replace("/success");
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถลงคะแนนในระบบได้");
    } finally {
      setFetch(false);
    }
  }
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Wizard>
        <div className="flex flex-col gap-4 font-medium">
          <h2 className="text-2xl">เลือกผู้ลงสมัครรับเลือกตั้ง</h2>
          <span className="text-red-500">{props.stdName}</span>
        </div>
        <span className="text-gray-500 text-sm leading-6 sarabun-font">
          กรุณาลงคะแนนให้ผู้สมัครที่ต้องการ
          เมื่อลงคะแนนแล้วจะไม่สามารถแก้ไขได้อีก
          <br />
          หากเกิดข้อผิดพลาดใด ๆ
          กรุณาแจ้งคณะกรรมการนักเรียนเพื่อดำเนินการแก้ไขต่อไป
        </span>

        {errorText && (
          <span className="p-4 rounded-lg bg-red-200 text-red-600 font-bold">
            {errorText}
          </span>
        )}
        <div
          className={
            "items-center justify-center flex-row flex-wrap flex gap-8"
          }
        >
          {data &&
            data.map((d, i) => (
              <button
                style={{ minWidth: 250, minHeight: 150 }}
                onClick={() => setModal({ show: true, data: d })}
                key={d.name}
                className={
                  "sarabun-font sm:w-auto w-full focus:outline-none border shadow-md rounded p-4 flex flex-col justify-center space-y-2 " +
                  "bg-white hover:bg-gray-100 cursor-pointer "
                }
              >
                <div className="flex w-full flex-row">
                  <div className="flex flex-col space-y-2 pr-2 text-sm flex-grow items-start">
                    <h3 className="text-xl font-bold text-left">
                      ชื่อ นามสกุล
                    </h3>
                    <span className="font-medium text-blue-500">
                      ผู้สมัครคนที่ {d.order}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 flex-col space-y-1 items-end font-bold">
                    <span>เบอร์</span>
                    <b className={"text-3xl text-blue-500"}>{d.order}</b>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start space-y-1 text-left">
                  <span className={"text-apple-500" + " font-bold"}>
                    คลิกเพื่อลงคะแนน
                  </span>
                </div>
              </button>
            ))}
        </div>
        {data && data.length === 0 && (
          <div className="flex items-center justify-center h-32 w-full">
            ไม่มีข้อมูล
          </div>
        )}
        <ModalComponent
          closable={true}
          onClose={() => setModal((m) => ({ ...m, show: false }))}
          show={modal.show}
          title="รายละเอียดชุมนุม"
          size="max-w-lg"
          titleClass="bg-yellow-300 text-gray-900 bg-opacity-80 font-bold sarabun-font"
        >
          <div className="p-4 flex flex-row h-24 sarabun-font">
            {modal.data && (
              <>
                <div className="flex flex-col space-y-2 pr-2 text-sm flex-grow items-start">
                  <h3 className="text-xl font-bold text-left">ชื่อ นามสกุล</h3>
                  <span className="font-medium text-blue-500">
                    ผู้สมัครคนที่ {modal.data.order}
                  </span>
                </div>
                <div className="flex flex-shrink-0 flex-col space-y-1 items-end font-bold">
                  <span>เบอร์</span>
                  <b className={"text-3xl text-blue-500"}>{modal.data.order}</b>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col space-y-2 border-t py-4 my-2 items-center text-center sarabun-font">
            <h3 className="text-lg font-bold">
              คุณต้องการลงคะแนนเสียงให้เบอร์{" "}
              {data ? modal.data && modal.data.order : 0} หรือไม่
            </h3>
            <span>
              เมื่อกดลงคะแนนแล้วจะไม่สามารถแก้ไขในภายหลังได้
              <br />
              กรุณาตรวจสอบข้อมูลให้เรียบร้อย
            </span>
          </div>
          <div className="p-6 bg-gray-100 grid grid-cols-2 gap-4">
            <button
              disabled={fetching}
              className="btn px-4 py-2 text-gray-800 from-gray-200 to-gray-300 bg-gray-200 ring-gray-400 sarabun-font"
              onClick={() => setModal((m) => ({ ...m, show: false }))}
            >
              ยกเลิก
            </button>
            <button
              disabled={fetching}
              onClick={() => select()}
              className={
                "from-green-500 to-green-600 bg-green-500 ring-green-500 btn px-4 py-2 text-white sarabun-font"
              }
            >
              ลงคะแนน
            </button>
          </div>
        </ModalComponent>
      </Wizard>
    </div>
  );
}
