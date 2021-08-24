import Image from "next/image";
import logo from "../../public/logo.png";

export default function Header() {
  return (
    <header className="flex flex-col w-full border-b p-4 items-center gap-4 justify-center text-center">
      <div className="flex flex-row gap-4 items-center">
        <div>
          <Image src={logo} alt="Logo" width={60} height={60} />
        </div>
        <div className="font-bold text-lg md:text-xl flex flex-col sm:flex-row gap-2">
          <span>การเลือกตั้งประธานนักเรียน</span>
          <span>ปีการศึกษา 2564</span>
        </div>
      </div>
    </header>
  );
}
