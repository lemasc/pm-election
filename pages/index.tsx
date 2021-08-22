import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import banner from "../public/logo.jpg";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>WPM Election System</title>
      </Head>
      <main className="flex flex-1 flex-col items-center justify-center text-center space-y-8">
        <Image src={banner} alt="Logo" width={120} height={120} />
        <h1 className="text-2xl font-bold">
          การเลือกตั้งประธานนักเรียน ปีการศึกษา 2564
        </h1>

        <Link href="/login">
          <a className="mb-8 px-4 py-2 btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 font-bold text-white">
            เริ่มต้นใช้งาน
          </a>
        </Link>
      </main>
    </div>
  );
}
