import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex justify-center items-center border p-8 w-full text-gray-500 text-sm">
      <Link href="/api/logout">
        <a title="ออกจากระบบ" className="underline">
          ยกเลิกทั้งหมดและออกจากระบบการลงคะแนน
        </a>
      </Link>
    </footer>
  );
}
