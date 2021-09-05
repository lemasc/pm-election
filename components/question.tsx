import { ReactNode } from "react";
import Link from "next/link";

type Props = {
  children: ReactNode;
};

function Badge({ children, className }: Props & { className: string }) {
  return (
    <span
      className={`${className} font-bold rounded-full flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0`}
    >
      {children}
    </span>
  );
}
function Question({ children }: Props) {
  return (
    <div className="flex flex-row items-center gap-4 font-bold">
      <Badge className="bg-purple-500 text-white">Q:</Badge>
      {children}
    </div>
  );
}

function Answer({ children }: Props) {
  return (
    <div className="flex flex-row items-center gap-4">
      <Badge className="bg-gray-200 text-gray-800">A:</Badge>
      <span className="sm:leading-7 leading-6">{children}</span>
    </div>
  );
}

function Item({ children, isLast }: { children: JSX.Element[]; isLast?: true }) {
  return (
    <div
      className={`flex flex-col sm:gap-2 gap-4 ${
        isLast ? "" : "border-b sm:mb-4 sm:pb-4 mb-6 pb-6"
      }`}
    >
      {children}
    </div>
  );
}
export default function QuestionSection() {
  return (
    <div className="flex flex-col">
      <Item>
        <Question>
          หากไม่ได้เข้าสู่ระบบและตรวจสอบข้อมูลก่อนวันที่ 8 ก.ย. จะเกิดปัญหาใด ๆ หรือไม่
        </Question>
        <Answer>
          ไม่เกิดปัญหาในการลงคะแนน แต่หากข้อมูลนักเรียนไม่ถูกต้องหรือไม่สามารถเข้าสู่ระบบได้
          ทางคณะกรรมการนักเรียนจะไม่รับผิดชอบในการแก้ไขใด ๆ ทั้งสิ้น
        </Answer>
      </Item>
      <Item>
        <Question>เมื่อลงคะแนนไปแล้ว จะสามารถเปลี่ยนแปลงหรือแก้ไขได้อีกหรือไม่</Question>
        <Answer>
          เมื่อลงคะแนนไปแล้ว จะไม่สามารถเปลี่ยนแปลงหรือแก้ไขการลงคะแนนได้อีก ไม่ว่ากรณีใด ๆ{" "}
        </Answer>
      </Item>
      <Item>
        <Question>จะรู้ได้อย่างไรว่าลงคะแนนในระบบเสร็จสิ้นแล้ว</Question>
        <Answer>
          หากระบบรับข้อมูลการลงคะแนนแล้ว ระบบจะแสดงหน้า{" "}
          <b className="text-green-600">ลงคะแนนเรียบร้อยแล้ว</b> เท่านั้น
          และสามารถเข้าสู่ระบบเพื่อตรวจสอบข้อมูลได้อีกครั้ง โดยระบบจะแสดงชื่อและหมายเลขที่ได้ลงคะแนน
        </Answer>
      </Item>
      <Item isLast={true}>
        <Question>หากเกิดปัญหาขัดข้องในการเข้าใช้งานเว็บไซต์ จะทำอย่างไร</Question>
        <Answer>
          ให้ถ่ายรูปหรือบันทึกหน้าจอ แล้วไปยังเมนู{" "}
          <Link href="/report" prefetch={false}>
            <a className="text-blue-600 underline" target="_blank" rel="noreferrer noopener">
              รายงานปัญหา
            </a>
          </Link>{" "}
          เพื่อแจ้งปัญหาแก่คณะกรรมการนักเรียนต่อไป
        </Answer>
      </Item>
    </div>
  );
}
