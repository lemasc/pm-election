import type { NextApiResponse } from "next";
import parse from "node-html-parser";

import { APIRequest, withSession, NextApiSessionRequest, withAuth } from "@/shared/api";
import admin from "@/shared/firebase-admin";
import { createEmail } from "@/shared/authContext";
import { checkParameters } from "../login";

type StudentExportList = {
  id: string;
  name: string;
  acc: boolean;
  vote?: boolean;
};

async function handler(req: NextApiSessionRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false });
  try {
    if (!req.body || !checkParameters(req.body, ["class", "room"]))
      return res.status(400).json({ success: false });
    const api = new APIRequest(req);
    const login = await api.post(
      "/index.php?r=club_result_all&ac=view",
      new URLSearchParams({
        sterm: "1",
        syear: "2564",
        sclub: "",
        sclass: req.body.class as string,
        sroom: req.body.room,
      }),
      {
        responseType: "document",
      }
    );
    const document = parse(login.data.replace(/\t/g, ""));
    const table = document.querySelectorAll("tr");
    // First, we retrieve all students from the chumnum page.
    const data: Record<string, StudentExportList> = table.reduce((data, row, i) => {
      if (i === 0) return data;
      function getCell(index: number) {
        return row.childNodes
          .filter((t) => t.innerText.trim() != "")
          [index].innerText.replace("&nbsp;&nbsp;", " ")
          .replace(/\s+/g, " ")
          .replace("ม.", "");
      }
      const fields = {
        id: getCell(1),
        name: getCell(3),
      };
      return {
        ...data,
        [createEmail(fields.id)]: { ...fields, acc: false },
      };
    }, {});
    // Then, we get the users from the firebase auth.
    // Users that voted on the system will be recorded automatically.
    const auth = admin.auth();
    const emails = Object.values(data).map((e) => ({ email: createEmail(e.id) }));
    const users = await auth.getUsers(emails);
    // Finally, match the claims with the chumnum response data.
    users.users.map((v) => {
      if (v.email && data[v.email]) {
        data[v.email] = {
          ...data[v.email],
          name: v.displayName as string,
          acc: true,
          vote: v.customClaims?.voted !== undefined,
        };
      }
    });
    return res.status(200).json(Object.values(data).map((v) => Object.values(v)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

export default withSession(handler);
