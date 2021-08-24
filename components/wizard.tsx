import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { ReactNodeArray } from "react";

import Footer from "./layout/footer";
import Header from "./layout/header";
import Layout from "./layout";

type WizardProps = {
  children: ReactNodeArray;
};

type WizardItem = {
  page: string;
  name: string;
};
const items: WizardItem[] = [
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
export default function Wizard({ children }: WizardProps) {
  const [currentPage, setCurrentPage] = useState(-1);
  const router = useRouter();

  function getTitle() {
    const title = ["WPM Election System"];
    const page = items && items[currentPage];
    if (page !== undefined) {
      title.push(page.name);
    }
    return title.reverse().join(" : ");
  }
  return (
    <>
      <Head>
        <title>{getTitle()}</title>
      </Head>
      <Header />
      <Layout>
        <div className="text-sm sm:text-base md:p-8 p-4 mx-8 sm:mx-4 flex md:flex-col flex-row flex-wrap md:w-auto border gap-4 bg-white rounded-lg flex-shrink-0">
          {items.map((d, i) => {
            if (router.pathname == `/${d.page}` && currentPage !== i)
              setCurrentPage(i);
            return (
              <div
                className={`flex flex-row gap-4 items-center cursor-default ${
                  i > currentPage
                    ? "text-gray-400"
                    : i == currentPage
                    ? "text-gray-900"
                    : ""
                }`}
                key={d.page}
              >
                <div
                  className={`font-bold border h-10 w-10 md:h-12 md:w-12 flex justify-center items-center rounded-lg text-lg ${
                    i <= currentPage
                      ? i == currentPage
                        ? "bg-gradient-to-b from-purple-500 to-purple-600 text-white shadow-md"
                        : "text-purple-700 bg-gray-50"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="sarabun-font">{d.name}</div>
              </div>
            );
          })}
        </div>
        <div className="shadow-md rounded-lg border bg-white p-8 flex flex-col gap-8 items-center justify-center mx-4">
          {children}
        </div>
      </Layout>
      {items.length - 1 !== currentPage && <Footer />}
    </>
  );
}
