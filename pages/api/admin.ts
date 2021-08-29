import type { NextApiResponse } from "next";
import { withSession, NextApiSessionRequest, withAuth } from "@/shared/api";

async function handler(req: NextApiSessionRequest, res: NextApiResponse) {
  if (req.token && !req.token.admin) {
    return res.status(403).send({ success: false });
  }
  req.session.destroy();
  req.session.set("admin", true);
  await req.session.save();
  return res.status(200).send({ success: true });
}

export default withAuth(withSession(handler));
