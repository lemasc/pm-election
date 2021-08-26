import { useRouter } from "next/router";
import { ReactNode, ReactNodeArray } from "react";
import MenuBarComponent from "./menubar";

type Paths = {
  page: string;
  name: string;
};

export const appPages: Paths[] = [
  {
    page: "login",
    name: "เข้าสู่ระบบ",
  },
  {
    page: "profile",
    name: "ตรวจสอบสถานะ",
  },
  {
    page: "select",
    name: "เลือกผู้ลงสมัคร",
  },
  {
    page: "success",
    name: "ลงคะแนนเสร็จสิ้น",
  },
];

export default function Layout({
  children,
}: {
  children: ReactNode | ReactNodeArray;
}) {
  const { pathname } = useRouter();

  const isSelectApp = appPages.map((p) => "/" + p.page).includes(pathname);
  return (
    <>
      <MenuBarComponent isSelectApp={isSelectApp} />
      <main
        className={`mt-20 flex flex-1 ${
          isSelectApp
            ? "md:flex-row md:items-start md:gap-2 justify-center items-center px-2 text-center gap-8"
            : "md:px-20 px-8 gap-4 pb-20"
        } flex-col py-8 bg-gray-50 w-full`}
      >
        {children}
      </main>
    </>
  );
}
