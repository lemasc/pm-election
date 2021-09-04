import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import banner from "../public/logo.png";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col h-screen items-center justify-center">
      <Head>
        <title>Maintenance : WPM Election System</title>
      </Head>
      <main className="flex flex-1 flex-col items-center justify-center text-center space-y-6 px-8">
        <Image src={banner} alt="Logo" width={100} height={100} />
        <h1 className="text-2xl font-medium header-font">
          ระบบเลือกตั้งประธานนักเรียน ปีการศึกษา 2564
        </h1>
        <span className="max-w-lg">
          ขณะนี้ระบบเกิดปัญหาขัดข้องและกำลังอยู่ในระหว่างการปรับปรุง ยังไม่สามารถดำเนินการตามคำขอได้
          กรุณารอสักครู่ แล้วจึงดำเนินการใหม่อีกครั้ง
        </span>
        <button
          onClick={() => router.back()}
          className="btn text-white bg-red-500 from-red-500 to-red-600 ring-red-500 px-4 py-2"
        >
          กลับไปยังหน้าก่อนหน้านี้
        </button>
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
