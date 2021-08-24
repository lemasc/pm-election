import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Transition } from "@headlessui/react";
import { LoginIcon, UserIcon } from "@heroicons/react/outline";

import logo from "../public/logo.png";

export default function HomePage() {
  const router = useRouter();
  const [focus, setFocus] = useState(false);
  const [hover, setHover] = useState(false);
  const [hero, setHero] = useState("");
  const [entered, setEnter] = useState(false);
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>หนัาหลัก : WPM Election System</title>
        <meta name="title" content="WPM Election System" />
      </Head>
      <main className="flex flex-1 sm:flex-row flex-col items-center justify-center text-center w-full">
        <Transition
          show={hero === ""}
          appear={true}
          className="justify-start self-stretch flex flex-col text-white sm:p-4 bg-yellow-300"
          enter="duration-1000 ease-in-out transition-width"
          enterFrom="w-0 "
          enterTo="w-full"
          entered="w-full "
          leave="duration-500 ease-in-out transition-width"
          leaveFrom="w-full"
          leaveTo="w-0"
          afterEnter={() => setEnter(true)}
          afterLeave={() => router.push(hero)}
        >
          <Transition
            show={entered}
            enter="transition-opacity duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            className="flex flex-col h-full"
          ></Transition>
        </Transition>
        <div className="flex flex-col p-10 flex-shrink-0 header-font h-screen justify-center">
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
              onClick={() => setHero("/login")}
              className="p-4 items-center justify-center gap-4 flex flex-row btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 text-white"
            >
              <LoginIcon className="h-10 w-10" transform="scale(-1,1)" />
              <div className="flex flex-col gap-0.5">
                <b className="font-medium text-xl">เริ่มต้นใช้งาน</b>
                <span className="font-light text-sm">
                  เข้าสู่ระบบการลงคะแนน
                </span>
              </div>
            </button>
            <button
              onClick={() => setHero("/candidates")}
              className="p-4 items-center justify-center gap-4 flex flex-row btn bg-blue-500 from-blue-500 to-blue-600 ring-blue-500 text-white"
            >
              <UserIcon className="h-8 w-8" />
              <span>ดูข้อมูลผู้ลงสมัครรับเลือกตั้ง</span>
            </button>
            <a
              href="https://www.instagram.com/coolkidssatit/"
              target="_blank"
              rel="noreferrer noopener"
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              className=" p-4 items-center justify-center gap-4 flex flex-row btn bg-white ring-2 hover:ring-0 from-purple-500 to-purple-600 ring-purple-500 text-gray-900 hover:text-white focus:text-white"
            >
              <Image
                alt="Instagram Icon"
                src="/instagram.svg"
                width={30}
                height={30}
                className={focus || hover ? "filter invert" : "opacity-90"}
              />
              <span>ติดต่อคณะกรรมการนักเรียน</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
