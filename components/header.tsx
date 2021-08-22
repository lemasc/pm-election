import Image from "next/image";
import logo from "../public/logo.jpg";

type HeaderProps = {
  step: number;
  desc: string;
};
export default function Header({ step, desc }: HeaderProps) {
  return (
    <header className="flex flex-col w-full border-b p-4 items-center gap-4 justify-center text-center">
      <div className="flex flex-row gap-4 items-center">
        <div>
          <Image src={logo} alt="Logo" width={60} height={60} />
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="font-bold text-xl flex flex-col sm:flex-row gap-0.5">
            <span>การเลือกตั้งประธานนักเรียน</span>
            <span>ปีการศึกษา 2564</span>
          </h1>
          <span className="text-gray-500 text-sm">
            ขั้นตอนที่ {step} : {desc}
          </span>
        </div>
      </div>
    </header>
  );
}
