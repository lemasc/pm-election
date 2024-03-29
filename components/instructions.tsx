import Image from "next/image";
import index from "../public/instructions/index.jpeg";
import login from "../public/instructions/login.jpeg";
import profile from "../public/instructions/profile.jpeg";
import profile_intime from "../public/instructions/profile_intime.jpeg";
import select from "../public/instructions/select.jpeg";
import modal from "../public/instructions/modal.png";
import success from "../public/instructions/success.jpeg";

export default function Instructions() {
  return (
    <div className="content bg-white rounded py-6 pr-6 border">
      <ol className="grid lg:grid-cols-2 gap-4">
        <li>
          <div className="content-sublist flex flex-col space-y-2">
            <span>
              เข้าสู่หน้าเว็บไซต์ จากนั้นเลือก <b>เข้าสู่ระบบ</b>
            </span>
            <div className="border">
              <Image src={index} alt="เข้าสู่หน้าหลัก จากนั้นเลือก เข้าสู่ระบบ" />
            </div>
          </div>
        </li>
        <li>
          <div className="content-sublist flex flex-col space-y-2">
            <p>
              <span>ป้อนรหัสประจำตัวนักเรียนและเลขประจำตัวประชาชนเพื่อเข้าสู่ระบบ</span>
              <br />
              <b className="text-red-500">
                หากเป็นการลงทะเบียนครั้งแรก ระบบจะแสดง Captcha สำหรับยืนยันตัวตน
              </b>
            </p>
            <div className="border">
              <Image
                src={login}
                alt="ป้อนรหัสประจำตัวนักเรียนและเลขประจำตัวประชาชนเพื่อเข้าสู่ระบบ"
              />
            </div>
          </div>
        </li>
        <li>
          <div className="content-sublist flex flex-col space-y-2">
            <p>
              <span>ระบบจะแสดงข้อมูลของนักเรียน ให้ตรวจสอบอย่างละเอียดว่าถูกต้องครบถ้วน</span>
              <br />
              <span className="text-red-500 font-bold">
                หากไม่ถูกต้องหรือไม่สามารถเข้าสู่ระบบได้ ให้แจ้งคณะกรรมการนักเรียน
              </span>
            </p>
            <div className="border">
              <Image
                src={profile}
                alt="ระบบจะแสดงข้อมูลของนักเรียน ให้ตรวจสอบข้อมูลอย่างละเอียดว่าถูกต้อง"
              />
            </div>
          </div>
        </li>
        <li>
          <div className="content-sublist flex flex-col space-y-2">
            <span>
              หากอยู๋ในระยะเวลาการลงคะแนน ระบบจะแสดงปุ่ม <b>ดำเนินการต่อ</b> เพื่อไปยังหน้าลงคะแนน
            </span>
            <div className="border">
              <Image
                src={profile_intime}
                alt="หากอยู๋ในระยะเวลาการลงคะแนน ระบบจะแสดงปุ่มดำเนินการต่อเพื่อไปยังหน้าลงคะแนน"
              />
            </div>
          </div>
        </li>
        <li>
          <div className="content-sublist flex flex-col space-y-2">
            <span>กดเลือกผู้สมัครที่ต้องการลงคะแนน หรือเลือกไม่ลงคะแนนให้ผู้สมัครใด</span>
            <div className="border">
              <Image
                src={select}
                alt="กดเลือกผู้สมัครที่ต้องการลงคะแนน หรือเลือกไม่ลงคะแนนให้ผู้สมัครใด"
              />
            </div>
          </div>
        </li>
        <li>
          <div className="content-sublist flex flex-col space-y-2">
            <span>
              ตรวจสอบข้อมูลผู้ลงสมัครก่อนการลงคะแนน แล้วกดปุ่ม <b>ลงคะแนน</b>
            </span>
            <div className="border">
              <Image src={modal} alt="ตรวจสอบข้อมูลผู้ลงสมัครก่อนการลงคะแนน แล้วกดปุ่มลงคะแนน" />
            </div>
          </div>
        </li>
        <li>
          <div className="content-sublist flex flex-col space-y-2">
            <span>หากระบบบันทึกข้อมูลเรียบร้อยจะแสดงข้อมูลการลงคะแนน เป็นอันเสร็จสิ้น</span>
            <div className="border">
              <Image
                src={success}
                alt="หากระบบบันทึกข้อมูลเรียบร้อยจะแสดงข้อมูลการลงคะแนน เป็นอันเสร็จสิ้น"
              />
            </div>
          </div>
        </li>
      </ol>
    </div>
  );
}
