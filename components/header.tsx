import Image from "next/image";
import logo from "../public/logo.png";

export default function Header() {
  return (
    <header className="flex flex-col w-full border-b p-4 items-center gap-4 justify-center text-center">
      <div className="flex flex-row gap-4 items-center header-font">
        <div>
          <Image src={logo} alt="Logo" width={60} height={60} />
        </div>
        <h1 className="font-medium text-xl flex flex-col sm:flex-row gap-2">
          <span>การเลือกตั้งประธานนักเรียน</span>
          <span>ปีการศึกษา 2564</span>
        </h1>
      </div>
    </header>
  );
}
