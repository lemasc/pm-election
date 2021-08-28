import type { NextApiResponse } from "next";
import { APIRequest, withSession, NextApiSessionRequest } from "@/shared/api";

async function handler(req: NextApiSessionRequest, res: NextApiResponse) {
  try {
    const api = new APIRequest(req);
    const image = await api.get("/assets/function/AntiBotCaptcha/draw/abc.php?" + Math.random(), {
      responseType: "arraybuffer",
    });
    await req.session.save();
    res.setHeader("Content-Type", "image/jpeg");
    res.status(200).end(Buffer.from(image.data, "binary"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

export default withSession(handler);
