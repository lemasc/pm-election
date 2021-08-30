import type { NextApiResponse } from "next";
import { withAPISession, NextApiSessionRequest } from "@/shared/api/session";

export default withAPISession(async (req: NextApiSessionRequest, res: NextApiResponse) => {
  const admin = req.session.get("admin");
  req.session.destroy();
  await req.session.save();
  res.redirect(admin ? "/admin/login" : "/");
});
