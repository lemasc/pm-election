import React from "react";
import { Disclosure, Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useWindowWidth } from "@react-hook/window-size/throttled";

import { MenuIcon, XIcon } from "@heroicons/react/outline";

type MenuBarProps = {
  isSelectApp?: boolean;
};

type Navigation = {
  href: string;
  title: string;
};

const navigation: Navigation[] = [
  {
    href: "/",
    title: "หน้าหลัก",
  },
  {
    href: "/candidates",
    title: "ผู้ลงสมัคร",
  },
  {
    href: "/instuctions",
    title: "ขั้นตอนการใช้งาน",
  },
];

function Pages(): JSX.Element | null {
  const router = useRouter();
  return (
    <>
      {navigation.map((n) => (
        <Link key={n.title} href={n.href}>
          <a
            title={n.title}
            className="cursor-pointer rounded-lg h-full text-sm hover:text-gray-600"
            aria-current={n.href == router.pathname ? "page" : undefined}
          >
            {n.title}
          </a>
        </Link>
      ))}
    </>
  );
}

export default function MenuBarComponent({
  isSelectApp,
}: MenuBarProps): JSX.Element {
  const width = useWindowWidth({ fps: 60 });
  return (
    <>
      <Disclosure as="nav" className="z-10">
        {({ open }) => (
          <>
            <div
              className={
                "h-20 bg-white shadow-md" +
                " w-full fixed top-0 left-0 flex flex-row items-center justify-start md:px-16 px-6 py-4 transition duration-300 ease-in-out"
              }
            >
              <div
                title="WPM Election System"
                className="flex flex-row items-center select-none flex-grow"
              >
                <div className={width >= 375 ? undefined : "hidden"}>
                  <Image alt="Logo" src="/logo.png" width={50} height={50} />
                </div>

                <h1 className={"px-4 flex flex-col header-font gap-0.5"}>
                  <span className="text-gray-900 text-lg">
                    ระบบเลือกตั้งประธานนักเรียน
                  </span>
                  <span className="text-xs font-light text-gray-500">
                    โรงเรียนมัธยมสาธิตวัดพระศรีมหาธาตุ
                  </span>
                </h1>
              </div>
              {width >= 640 && !isSelectApp && (
                <div className="flex flex-row space-x-8">
                  <Pages />
                </div>
              )}
              {!isSelectApp && width < 640 && (
                <div
                  className={
                    "flex-row absolute top-0 right-0 p-6 space-x-4 sm:hidden flex"
                  }
                >
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-gray-600 focus:outline-none">
                    <span className="sr-only hidden">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-8 w-8" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-8 w-8" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              )}
            </div>
            <Transition
              show={!isSelectApp && open && width <= 640}
              enter="transition duration-250 ease-in"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-250 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
              className="fixed inset-0 border-t mt-20 w-full"
            >
              <Disclosure.Panel static>
                <div className="p-6 flex flex-col bg-gray-50 dark:bg-gray-800 rounded-b-lg w-full shadow-lg space-y-6">
                  <Pages />
                </div>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </>
  );
}
