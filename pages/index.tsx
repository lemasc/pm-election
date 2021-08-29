import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Transition } from "@headlessui/react";
import { ClockIcon, LoginIcon, UserIcon, FlagIcon } from "@heroicons/react/outline";
import { useWindowWidth } from "@react-hook/window-size/throttled";

import logo from "../public/logo.png";

type TimelineProps = { children: JSX.Element | JSX.Element[] };

function TimelineHead({ children }: TimelineProps) {
  return <div className="flex flex-col sm:flex-row gap-4 ">{children}</div>;
}

function TimelineDate({ date, time }: { date: string; time?: string }) {
  const width = useWindowWidth();
  return (
    <div className="flex flex-row w-full sm:flex-col items-center sm:mt-2 sm:pt-3 bg-white sm:w-16 sm:gap-0 gap-2">
      <p className="leading-4">{date}</p>
      {time && (
        <p className="sm:text-xs text-gray-600">
          {width <= 1024 && "("}
          {time}
          {width <= 1024 && ")"}
        </p>
      )}
    </div>
  );
}
function TimelineLine() {
  return (
    <div className="hidden sm:flex flex-col mt-2 items-center h-full">
      <div className="rounded-full w-2 h-2 bg-purple-400"></div>
      <div className="w-0.5 h-full bg-purple-400"></div>
    </div>
  );
}

function TimelineData({
  children,
  title,
}: TimelineProps & {
  title: string;
}) {
  return (
    <div className="rounded-lg border border-opacity-40 border-gray-700 text-sm md:text-base px-4 md:px-6 w-full py-6 space-y-2 md:tracking-tight">
      <h1 className="font-bold text-purple-700">{title}</h1>
      {children}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [focus, setFocus] = useState(false);
  const [hover, setHover] = useState(false);
  const [redirect, setRedirect] = useState("");
  const [background, showBackground] = useState(true);
  const [aside, showAside] = useState(false);
  const width = useWindowWidth();

  function go(location: string) {
    if (width > 768 && background && aside) {
      setRedirect(location);
    } else {
      router.push(location);
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>หนัาหลัก : WPM Election System</title>
        <meta name="title" content="WPM Election System" />
      </Head>
      <main className="flex flex-1 lg:flex-row flex-col-reverse items-center justify-center text-center w-full">
        <Transition
          show={background}
          appear={true}
          className="justify-start self-stretch flex flex-col bg-yellow-300 lg:pb-0 pb-5"
          enter={width > 640 ? "duration-1000 ease-in transition-width" : ""}
          enterFrom="md:w-0"
          enterTo="lg:w-3/5 2xl:w-full"
          entered="lg:w-3/5 2xl:w-full"
          leave="duration-500 ease-out transition-width"
          leaveFrom="w-full"
          leaveTo="md:w-0 w-full"
          afterEnter={() => showAside(true)}
          afterLeave={() => router.push(redirect)}
        >
          <Transition
            show={background && aside && redirect == ""}
            enter="transition-opacity duration-1000"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="flex flex-col h-full items-center md:items-baseline justify-center p-4 mx-0.5 sm:mx-4 gap-6"
            afterLeave={() => showBackground(false)}
          >
            <div className="flex flex-col justify-center flex-grow w-full">
              <div className="bg-white w-full rounded-lg shadow-md flex flex-col text-left">
                <h2 className="text-lg text-gray-700 px-6 py-4 border-b">
                  <ClockIcon className="h-6 w-6 -mt-1 inline mr-4" />
                  Timeline
                </h2>
                <div className="space-y-6 justify-around px-6 py-4 pb-6">
                  <TimelineHead>
                    <div className="flex-shrink-0 text-sm">
                      <TimelineDate date="5 ก.ย. 64" />
                      <TimelineLine />
                    </div>
                    <TimelineData title="เข้าสู่ระบบและตรวจสอบข้อมูลส่วนตัว">
                      <p className="text-gray-700">
                        หากข้อมูลไม่ถูกต้องหรือไม่สามารถเข้าสู่ระบบได้ กรุณาแจ้งคณะกรรมการนักเรียน
                        เพื่อดำเนินการปรับปรุงให้ถูกต้องก่อนถึงวันลงคะแนน
                      </p>
                    </TimelineData>
                  </TimelineHead>
                  <TimelineHead>
                    <div className="flex-shrink-0 text-sm">
                      <TimelineDate date="8 ก.ย. 64" time="08:30 น." />
                      <TimelineLine />
                    </div>
                    <TimelineData title="ลงคะแนนเลือกประธานนักเรียน">
                      <p className="text-gray-700">
                        นักเรียนทุกคนมีสิทธิ 1 เสียงในการเลือกประธานนักเรียนสำหรับปีการศึกษานี้ 1 คน
                        โดยสามารถเลือกได้เพียงครั้งเดียวเท่านั้น และไม่สามารถแก้ไขได้ในภายหลัง
                      </p>
                      <p className="text-xs sm:text-sm pt-2 text-gray-500">
                        ระบบจะเปิดให้ลงคะแนนได้ตั้งแต่เวลา 08:30 - 17.00 น.
                      </p>
                    </TimelineData>
                  </TimelineHead>
                  <TimelineHead>
                    <div className="flex-shrink-0 text-sm">
                      <TimelineDate date="8 ก.ย. 64" time="17:30 น." />
                    </div>
                    <TimelineData title="ประกาศผลการเลือกตั้ง">
                      <p className="text-gray-700 tracking-tight">
                        ผ่านเว็บไซต์การเลือกตั้ง และช่องทางต่าง ๆ ของคณะกรรมการนักเรียน
                      </p>
                    </TimelineData>
                  </TimelineHead>
                </div>
              </div>
            </div>
            <div className="text-sm 2xl:text-base gap-1 flex flex-col items-center md:items-start md:mb-2">
              <span>ดำเนินการโดย คณะกรรมการนักเรียน ปีการศึกษา 2563</span>
              <span>พัฒนาเว็บโดย นายศักดิธัช ธนาสดใส</span>
            </div>
          </Transition>
        </Transition>
        <div className="flex flex-col items-center justify-center flex-grow 2xl:flex-grow-0 2xl:flex-shrink-0 p-4">
          <div className="flex flex-col p-6 header-font justify-center">
            <div>
              <Image src={logo} alt="Logo" width={120} height={120} />
            </div>
            <h1 className="text-2xl font-bold flex flex-col gap-1">
              <span>การเลือกตั้งประธานนักเรียน</span>
              <span>ปีการศึกษา 2564</span>
            </h1>
            <span className="font-light py-4">
              โรงเรียนมัธยมสาธิตวัดพระศรีมหาธาตุ มหาวิทยาลัยราชภัฏพระนคร
            </span>
            <div className="flex flex-col gap-4 py-4">
              <button
                title="เข้าสู่ระบบการลงคะแนน"
                onClick={() => go("/login")}
                className="btn-large btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 text-white"
              >
                <LoginIcon className="h-10 w-10" transform="scale(-1,1)" />
                <div className="flex flex-col gap-0.5">
                  <b className="font-medium text-xl">เริ่มต้นใช้งาน</b>
                  <span className="font-light text-sm">เข้าสู่ระบบการลงคะแนน</span>
                </div>
              </button>
              <button
                title="ข้อมูลผู้ลงสมัครรับเลือกตั้ง"
                onClick={() => go("/candidates")}
                className="btn-large btn bg-blue-500 from-blue-500 to-blue-600 ring-blue-500 text-white"
              >
                <UserIcon className="h-8 w-8" />
                <span>ข้อมูลผู้ลงสมัครรับเลือกตั้ง</span>
              </button>
              <a
                title="รายงานปัญหา"
                href="https://docs.google.com/forms/d/e/1FAIpQLSejSg8HOvxdABmJ-qzct6YUBx0t_y9TrjztuEFhqIzkqYq7eA/viewform?usp=sf_link"
                target="_blank"
                rel="noreferrer noopener"
                className="btn-large btn ring-2 bg-red-500 from-red-500 to-red-600 ring-red-500 text-white"
              >
                <FlagIcon className="h-6 w-6" />
                <span>รายงานปัญหา</span>
              </a>
            </div>
          </div>
          <a
            title="Instagram คณะกรรมการนักเรียน (@coolkidssatit)"
            href="https://www.instagram.com/coolkidssatit/"
            target="_blank"
            rel="noreferrer noopener"
            className="opacity-75 flex items-center justify-center gap-2 my-2 font-medium header-font hover:underline"
          >
            <Image
              alt="Instagram Icon"
              src="/instagram.svg"
              width={20}
              height={20}
              className="-mt-1 inline mr-4"
            />
            <span>coolkidssatit</span>
          </a>
        </div>
      </main>
    </div>
  );
}
