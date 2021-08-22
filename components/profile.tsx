import { LoginResult } from "@/types/login";

export default function Profile(props: LoginResult) {
  return (
    <div className="p-8 bg-gray-200 grid grid-cols-2 rounded max-w-3xl text-left gap-2 sarabun-font">
      <b>เลขประจำตัว:</b>
      <span>{props.stdID}</span>
      <b>ชื่อ:</b>
      <span>{props.stdName}</span>
      <b>ชั้น:</b>
      <span>{props.stdClass}</span>
      <b>เลขที่: </b>
      <span>{props.stdNo}</span>
      <b>สถานะ: </b>
      <span
        className={
          "font-bold " + (!props.votes ? "text-red-500" : "text-green-700")
        }
      >
        {!props.votes ? "ยังไม่ได้ลงคะแนน" : "ลงคะแนนแล้ว"}
      </span>
      {props.votes && (
        <>
          <b>ผู้สมัครที่ลงคะแนน:</b>
          <span>
            {props.votes.name} (เบอร์ {props.votes.selected})
          </span>
        </>
      )}
    </div>
  );
}
