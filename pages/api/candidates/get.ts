import type { NextApiResponse } from "next";
import { withSession, NextApiSessionRequest } from "@/shared/api";
import { candidates } from "@/shared/candidates"

async function handler(req: NextApiSessionRequest, res: NextApiResponse) {
  if(req.method !== "GET") return res.status(400).json({success: false})
  return res.status(200).json({success: true, candidates})
}

export default withSession(handler);
