import { createRef, useState } from "react";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

import { Candidate, getCandidates } from "@/shared/candidates";
import { useAuth } from "@/shared/authContext";
import Wizard from "@/components/wizard";
const ModalComponent = dynamic(() => import("@/components/layout/modal"));

type ServerProps = {
  candidates: Candidate[];
};

type ModalState = {
  show: boolean;
  data?: Candidate;
};

export const getServerSideProps: GetServerSideProps<ServerProps> = async () => {
  const candidates = await getCandidates(true);
  return {
    props: {
      candidates,
    },
  };
};

export const noCandidate: Candidate = {
  index: 7,
  title: "",
  name: "ไม่ประสงค์ลงคะแนน",
  surname: "",
  class: "-",
};

function CandidateItem({ data }: { data: Candidate }) {
  return (
    <>
      <div className="flex flex-col space-y-2 pr-2 text-sm flex-grow items-start text-left">
        <h3 className="text-xl font-bold mr-8">
          {data.title}
          {data.name} {data.surname}
        </h3>
        <span className="font-medium text-blue-500">
          {data.class !== "-"
            ? `ชั้นมัธยมศึกษาปีที่ ${data.class}`
            : `ไม่ประสงค์ลงคะแนนให้ผู้สมัครใด`}
        </span>
      </div>
      <div className="flex flex-shrink-0 flex-col space-y-1 items-end font-bold">
        <span>หมายเลข</span>
        <b className={"text-3xl text-blue-500"}>
          {data.index === 7 ? "-" : data.index}
        </b>
      </div>
    </>
  );
}
export default function SelectPage({ candidates: data }: ServerProps) {
  const { profile: props, user } = useAuth();
  const recaptchaRef = createRef<ReCAPTCHA>();
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ show: false });
  const [errorText, setError] = useState<string | null>(null);
  const [fetching, setFetch] = useState(false);
  async function select() {
    if (!modal.data || !modal.data.index) return;
    const token = await recaptchaRef.current?.executeAsync();
    if (!token) return;
    try {
      setFetch(true);
      await axios.post(
        "/api/select",
        new URLSearchParams({
          id: modal.data.index.toString(),
          token,
        }),
        {
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
        }
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
        {props && (
          <>
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
                "items-center justify-center grid md:grid-cols-2 2xl:grid-cols-3 gap-8"
              }
            >
              {data &&
                [...data, noCandidate].map((d, i) => (
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
                      <CandidateItem data={d} />
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
              title="รายละเอียดผู้ลงสมัคร"
              size="max-w-lg"
              titleClass="bg-yellow-300 text-gray-900 bg-opacity-80 font-bold sarabun-font"
            >
              <div className="p-4 flex flex-row h-24 sarabun-font items-center">
                {modal.data && <CandidateItem data={modal.data} />}
              </div>
              <div className="flex flex-col space-y-2 border-t py-4 my-2 items-center text-center sarabun-font">
                {modal.data && (
                  <h3 className="text-lg font-bold">
                    {modal.data.index !== 7
                      ? `คุณต้องการลงคะแนนเสียงให้หมายเลข ${modal.data.index} หรือไม่`
                      : "คุณไม่ต้องการลงคะแนนเสียงให้หมายเลขใดเลยหรือไม่"}
                  </h3>
                )}
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
          </>
        )}
        <ReCAPTCHA
          size="invisible"
          ref={recaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA as string}
        />
      </Wizard>
    </div>
  );
}
