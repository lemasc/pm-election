import { createRef, useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
//import ReCAPTCHA from "react-google-recaptcha";

import { Candidate, CandidateDatabase } from "@/shared/candidates";
import { useAuth } from "@/shared/authContext";
import Wizard from "@/components/wizard";
import { withConfig } from "@/shared/api/config";
import { withSession } from "@/shared/api/session";
import { getClientIp } from "@supercharge/request-ip/dist";
//import instance, { RETRY_MSG } from "@/shared/request";
const ModalComponent = dynamic(() => import("@/components/layout/modal"));

type ServerProps = {
  candidates: Candidate[];
  ip: string;
};

type ModalState = {
  show: boolean;
  data?: Candidate;
};

export const noCandidate: Candidate = {
  index: 7,
  title: "",
  name: "ไม่ประสงค์ลงคะแนน",
  surname: "",
  class: "-",
};

export const getServerSideProps: GetServerSideProps<ServerProps> = withConfig(
  withSession(async ({ req }) => {
    /*    const data = req.session.get("profile");
    if (data) {
      // Profile session will only set if user was selected.
      return {
        redirect: {
          destination: "/",
          permanent: true,
        },
      };
    }*/
    const db = new CandidateDatabase(req);
    const candidates = await db.getCandidates(true);

    return {
      props: {
        candidates,
        ip: getClientIp(req),
      },
    };
  })
);

function CandidateItem({ data }: { data: Candidate }) {
  return (
    <>
      <div className="flex flex-col space-y-2 pr-2 text-sm flex-grow items-start text-left">
        <h3 className="text-xl font-bold mr-8 flex flex-row flex-wrap gap-1">
          <span>
            {data.title}
            {data.name}
          </span>
          <span>{data.surname}</span>
        </h3>
        <span className="font-medium text-blue-500">
          {data.class !== "-"
            ? `ชั้นมัธยมศึกษาปีที่ ${data.class}`
            : `ไม่ประสงค์ลงคะแนนให้ผู้สมัครใด`}
        </span>
      </div>
      <div className="flex flex-shrink-0 flex-col space-y-1 items-end font-bold">
        <span>หมายเลข</span>
        <b className={"text-3xl text-blue-500"}>{data.index === 7 ? "-" : data.index}</b>
      </div>
    </>
  );
}
export default function SelectPage({ candidates: data, ip }: ServerProps) {
  const { profile: props, select: selectCandidate, votes, ready } = useAuth();
  //const recaptchaRef = createRef<ReCAPTCHA>();
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ show: false });
  const [errorText, setError] = useState<string | null>(null);
  const [fetching, setFetch] = useState(false);
  async function select() {
    if (!modal.data || !modal.data.index || !props) return;
    try {
      setFetch(true);
      setError(null);
      /* await instance(user, () => setError(RETRY_MSG), recaptchaRef.current).post(
        "/api/select",
        new URLSearchParams({
          id: modal.data.index.toString(),
        })
      );*/
      await selectCandidate(modal.data, ip);
      router.replace("/success");
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถลงคะแนนในระบบได้");
      setFetch(false);
    } finally {
      setError(null);
    }
  }
  useEffect(() => {
    if (ready && !fetching && ((votes && votes.selected) || !props)) {
      router.replace("/");
    }
  }, [props, ready, router, votes, fetching]);
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
              กรุณาลงคะแนนให้ผู้สมัครที่ต้องการ เมื่อลงคะแนนแล้วจะไม่สามารถแก้ไขได้อีก
              <br />
              หากเกิดข้อผิดพลาดใด ๆ กรุณาแจ้งคณะกรรมการนักเรียนเพื่อดำเนินการแก้ไขต่อไป
            </span>
            <div
              className={"items-center justify-center grid md:grid-cols-2 2xl:grid-cols-3 gap-8"}
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
                      <span className={"text-apple-500" + " font-bold"}>คลิกเพื่อลงคะแนน</span>
                    </div>
                  </button>
                ))}
            </div>
            {data && data.length === 0 && (
              <div className="flex items-center justify-center h-32 w-full">ไม่มีข้อมูล</div>
            )}
            <ModalComponent
              closable={!fetching}
              onClose={() => setModal((m) => ({ ...m, show: false }))}
              show={modal.show}
              title="รายละเอียดผู้ลงสมัคร"
              size="max-w-lg"
              titleClass="bg-yellow-300 text-gray-900 bg-opacity-80 font-bold"
            >
              <div className="p-4 flex flex-row items-center">
                {modal.data && <CandidateItem data={modal.data} />}
              </div>
              <div className="flex flex-col space-y-2 border-t p-4 my-2 items-center text-center">
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

                {errorText && <span className="text-red-600 font-bold">{errorText}</span>}
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
        {/*<ReCAPTCHA
          size="invisible"
          ref={recaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA as string}
        />*/}
      </Wizard>
    </div>
  );
}
