import type { NextApiResponse } from "next";
import { withSession, NextApiSessionRequest } from "@/shared/api";

async function handler(req: NextApiSessionRequest, res: NextApiResponse) {
  req.session.destroy();
  await req.session.save();
  res.redirect("/");
}

export default withSession(handler);
