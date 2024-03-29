import type { NextApiResponse } from "next";
import parse from "node-html-parser";

import admin from "@/shared/firebase-admin";
import { createEmail } from "@/shared/authContext";
import { LoginResult } from "@/types/login";
import { NextApiSessionRequest, withAPISession } from "@/shared/api/session";
import { APIRequest } from "@/shared/api/request";
import { APIResponse } from "@/shared/api";

const params = ["stdID", "stdIDCard", "captcha"];

export function checkParameters(body: string[], params: string[]) {
  const keys = Object.keys(body);
  return (
    keys.length === params.length &&
    keys.map((k) => params.includes(k)).filter((v) => v).length === params.length
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

const ignoreFields = ["stdIDCard", "term"];

export default withAPISession(
  async (req: NextApiSessionRequest, res: NextApiResponse<APIResponse>) => {
    if (req.method !== "POST") return res.status(405).json({ success: false });
    try {
      if (!req.body || !checkParameters(req.body, params))
        return res.status(400).json({ success: false });
      const api = new APIRequest(req);
      const form = new URLSearchParams();
      Object.entries(req.body).map(([key, value]) => {
        form.append(key, value as string);
      });
      form.append("haction", "register_step1");
      /*   const login = await api.post("/process_query.php", form, {
        responseType: "document",
      });
      if ((login.data as string).includes("รหัสยืนยันตัวตน"))
        return res.status(401).json({ success: false });
      /* if ((login.data as string).includes("ไม่พบข้อมูลนักเรียนในระบบ"))
        return res.status(404).json({ success: false });
      const document = parse(login.data.replace(/\t/g, ""));
      const table = document.querySelectorAll("tr");
      const data: Array<string | boolean>[] = table
        .map((row) => {
          return row.childNodes
            .filter((t) => t.innerText.trim() != "")
            .map((t) =>
              fieldNames[t.innerText as never]
                ? fieldNames[t.innerText as never]
                : t.innerText
                    .replace("&nbsp;&nbsp;", " ")
                    .replace(/\s+/g, " ")
                    .replace("มัธยมศึกษาปีที่ ", "")
            );
        })
        .filter(([key]) => !ignoreFields.includes(key));
      if (document.querySelector("input[type='text']")) {
        data.push(["promptID", true]);
      } else {
        data.push(["promptID", false]);
      }

      await req.session.save();*/
      // Internal UID
      //const uid = document.querySelector("input[type='hidden']").attributes.value;
      const uid = "oRzRxASvH7";
      const final: LoginResult = {
        stdClass: "6/2",
        stdName: "นายนภัสดล อจลบุญ",
        stdID: "17392",
        stdNo: "7",
      };
      try {
        await admin.auth().createUser({
          uid,
          email: createEmail(final.stdID),
          displayName: final.stdName,
          password: req.body.stdIDCard,
        });
        await admin.auth().setCustomUserClaims(uid, {
          no: final.stdNo,
          class: final.stdClass,
        });
        return res.status(200).json({ success: true });
      } catch (err) {
        return res.status(403).json({ success: false });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  }
);
