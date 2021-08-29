import type { NextApiResponse } from "next";
import { withSession, NextApiSessionRequest } from "@/shared/api";

async function handler(req: NextApiSessionRequest, res: NextApiResponse) {
  const admin = req.session.get("admin");
  req.session.destroy();
  await req.session.save();
  res.redirect(admin ? "/admin/login" : "/");
}

export default withSession(handler);
