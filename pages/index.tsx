import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Transition } from "@headlessui/react";
import { LoginIcon } from "@heroicons/react/outline";

import logo from "../public/logo.png";

export default function HomePage() {
  const router = useRouter();
  const [hero, setHero] = useState(true);
  const [entered, setEnter] = useState(false);
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>หนัาหลัก : WPM Election System</title>
        <meta name="title" content="WPM Election System" />
      </Head>
      <main className="flex flex-1 sm:flex-row flex-col items-center justify-center text-center w-full">
        <Transition
          show={hero}
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
          afterLeave={() => router.push("/login")}
        >
          <Transition
            show={entered}
            enter="transition-opacity duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            className="flex flex-col h-full"
          ></Transition>
        </Transition>
        <div className="flex flex-col p-10 gap-8 flex-shrink-0 header-font">
          <div>
            <Image src={logo} alt="Logo" width={120} height={120} />
          </div>
          <div className="space-y-2 flex flex-col text-gray-900">
            <h1 className="text-2xl font-bold ">
              การเลือกตั้งประธานนักเรียน ปีการศึกษา 2564
            </h1>
            <span className="font-light">
              โรงเรียนมัธยมสาธิตวัดพระศรีมหาธาตุ มหาวิทยาลัยราชภัฏพระนคร
            </span>
          </div>

          <button
            onClick={() => setHero(false)}
            className="mb-8 p-4 items-center justify-center gap-4 flex flex-row btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 text-white"
          >
            <LoginIcon className="h-10 w-10" transform="scale(-1,1)" />
            <div className="flex flex-col gap-0.5">
              <b className="font-medium text-xl">เริ่มต้นใช้งาน</b>
              <span className="font-light text-sm">เข้าสู่ระบบการลงคะแนน</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
