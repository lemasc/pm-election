import type { NextApiResponse } from "next";
import { JSDOM } from "jsdom";

import {
  APIRequest,
  withSession,
  NextApiSessionRequest,
  APIResponse,
} from "@/shared/api";
import admin from "@/shared/firebase-admin";
import { LoginResult } from "@/types/login";

const params = ["stdID", "stdIDCard", "captcha"];

function checkParameters(body: string[]) {
  const keys = Object.keys(body);
  return (
    keys.length === params.length &&
    keys.map((k) => params.includes(k)).filter((v) => v).length ===
      params.length
  );
}
const fieldNames = {
  ปีการศึกษา: "term",
  เลขประจำตัวประชาชน: "stdIDCard",
  เลขประจำตัวนักเรียน: "stdID",
  เลขที่: "stdNo",
  "ชื่อ-นามสกุล": "stdName",
  ระดับชั้นปัจจุบัน: "stdClass",
};
const ignoreFields = ["stdIDCard","term"]

async function handler(
  req: NextApiSessionRequest,
  res: NextApiResponse<APIResponse>
) {
  if (req.method !== "POST") return res.status(405).json({ success: false });
  try {
    if (!req.body || !checkParameters(req.body))
      return res.status(400).json({ success: false });
    const api = new APIRequest(req);
    const form = new URLSearchParams();
    Object.entries(req.body).map(([key, value]) => {
      form.append(key, value as string);
    });
    form.append("haction", "register_step1");
    const login = await api.post("/process_query.php", form, {
      responseType: "document",
    });
    if ((login.data as string).includes("รหัสยืนยันตัวตน"))
      return res.status(403).json({ success: false });
    if ((login.data as string).includes("ไม่พบข้อมูลนักเรียนในระบบ"))
      return res.status(404).json({ success: false });
    const dom = new JSDOM(login.data.replace(/\t/g, ""));
    const document = (dom.window as unknown as Window).document;
    const table = document.querySelectorAll("tr");
    const data = [];
    let isEnd = false;
    table.forEach((row) => {
      if (isEnd || !row.cells) return;
      if (row.cells.length !== 2) {
        isEnd = true;
        return;
      }
      // @ts-ignore: Object is possibly 'null'.
      const name = fieldNames[row.cells.item(0).textContent];
      // @ts-ignore: Object is possibly 'null'.
      let value = row.cells.item(1).textContent as string;
      if (ignoreFields.includes(name)) {
        return;
      }
      if(name == "stdName") {
        value = value.replaceAll(/\s+/g," ")
      }
      else if(name == "stdClass") {
        value = value.replace("มัธยมศึกษาปีที่ ","")
      }
      data.push([name, value])
    });
    if (document.querySelector("input[type='text']")) {
      data.push(["promptID", true]);
    } else {
      data.push(["promptID", false]);
    }
    // Internal UID
    req.session.set(
      "uid",
      (document.querySelector("input[type='hidden']") as HTMLInputElement).value
    );
    const final:LoginResult = Object.fromEntries(data)
    const votes = await admin.firestore().collection("votes").where("stdID","==", final.stdID).orderBy("timestamp","asc").limit(1).get()
    if(votes.docs.length > 0) {
      const doc = votes.docs[0].data()
      final.votes = {
        selected: doc.selected,
        name: doc.name
      }
    }
    req.session.set("profile", final);
    await req.session.save();
    res.status(200).json({ success: true });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

export default withSession(handler);
