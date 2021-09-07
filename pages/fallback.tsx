import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import banner from "../public/logo.png";

import { GetServerSideProps } from "next";
import { getServerConfig } from "@/shared/api/config";
import { useEffect, useState } from "react";

export const getServerSideProps: GetServerSideProps = async () => {
  const config = await getServerConfig();
  if (!config.fallback) {
    return {
      redirect: {
        destination: "/login",
        permanent: true,
      },
    };
  }
  return { props: {} };
};

export default function Fallback() {
  const [canAccess, setCanAccess] = useState<boolean | undefined>(undefined);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      try {
        await fetch("https://pm-election.vercel.app", {
          mode: "no-cors",
        });
        setCanAccess(true);
      } catch (err) {
        console.error(err);
        setCanAccess(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (canAccess) {
      setTimeout(() => window.location.replace("https://pm-election.vercel.app/login"), 3000);
    }
  }, [canAccess]);
  return (
    <div className="flex flex-1 flex-col min-h-screen items-center justify-center">
      <Head>
        <title>{canAccess === false ? "Fallback" : "Redirect"} : WPM Election System</title>
      </Head>
      <main className="flex flex-1 flex-col items-center justify-center text-center space-y-6 p-8 sm:mx-16 leading-7">
        <Image src={banner} alt="Logo" width={100} height={100} />
        <h1 className="text-2xl font-medium header-font">
          ระบบเลือกตั้งประธานนักเรียน ปีการศึกษา 2564
        </h1>
        <h2 className="text-lg">
          {canAccess === false ? "ไม่สามารถเชื่อมต่อได้" : "กำลังดำเนินการเปลี่ยนเส้นทาง"}
        </h2>
        {canAccess === false ? (
          <>
            <span className="max-w-2xl">
              อินเทอร์เน็ตที่ใช้อยู่ตอนนี้ไม่รองรับการใช้งานกับ Server ของ Vercel
              กรุณาเปลี่ยนเครือข่าย (ใช้เน็ตมือถือ) หรือเปลี่ยนอุปกรณ์
              แล้วเข้าสู่หน้าเว็บใหม่อีกครั้ง
            </span>
            <span className="text-red-500 font-bold">
              เกิดขึ้นเฉพาะกับอินเทอร์เน็ตบ้าน (เช่น TOT) เท่านั้น เนื่องจากถูกกระทรวงดิจิทัลฯ บล็อค
              <br />
              <a
                title="เว็บไซต์ Vercel ถูกบล็อคจากรัฐบาลไทย"
                href="https://twitter.com/lemascth/status/1421807506997735424?s=20"
                className="text-blue-600 underline"
                target="_blank"
                rel="noreferrer noopener"
              >
                ทำไมจึงเป็นเช่นนั้น
              </a>
            </span>
            <button
              onClick={() => router.reload()}
              className="btn text-white bg-green-500 from-green-500 to-green-600 ring-green-500 px-4 py-2"
            >
              โหลดหน้านี้ใหม่
            </button>
          </>
        ) : (
          <span>
            เปลี่ยนเส้นทางไปยังเซิร์ฟเวอร์รอง (
            <a
              href="https://pm-election.vercel.app"
              className="text-blue-600 underline"
              title="Vercel Server"
              rel="noreferrer noopener"
            >
              https://pm-election.vercel.app
            </a>
            ) กรุณารอสักครู่...
          </span>
        )}
      </main>
      <footer className="p-8 border-t w-full text-center text-gray-500 text-sm">
        ตรวจสอบสถานะต่าง ๆ ได้ที่ Twitter{" "}
        <a
          href="https://www.twitter.com/lemascth"
          target="_blank"
          rel="noreferrer noopener"
          className="text-blue-600 underline"
        >
          @lemascth
        </a>{" "}
        และประกาศจากคณะกรรมการนักเรียนได้ที่ Instagram{" "}
        <a
          href="https://www.instagram.com/coolkidssatit"
          target="_blank"
          rel="noreferrer noopener"
          className="text-blue-600 underline"
        >
          @coolkidssatit
        </a>
      </footer>
    </div>
  );
}
