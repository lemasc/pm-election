
import type { NextApiResponse } from "next";
import { getClientIp } from '@supercharge/request-ip'
import { firestore } from "firebase-admin";

import {
  withSession,
  NextApiSessionRequest,
} from "@/shared/api";
import admin from "@/shared/firebase-admin";
import { LoginResult } from "@/types/login";
import axios from "axios";

async function verifyRecaptcha(req: NextApiSessionRequest) {
  try {
    const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", 
      new URLSearchParams({
      secret: process.env.RECAPTCHA as string,
      response: req.body.token as string,
      remoteip: getClientIp(req) as string
    }))
    return response.data && response.data.success
  }
  catch(err) {
    return false
  }
}
async function handler(req: NextApiSessionRequest, res: NextApiResponse) {
  try {
    const profile: LoginResult | undefined = req.session.get("profile");
    if (!req.session.get("uid") || !req.body.id || !req.body.name || !req.body.token)
      return res.status(400).json({ success: false });
    // Verify reCapthcha
    if(!(await verifyRecaptcha(req))) return res.status(403).json({success: false})
    const db = admin.firestore()
    const votes = {
      name: req.body.name,
      selected: parseInt(req.body.id),
    }
    await db.collection("votes").add({
        ...profile,
        ...votes,
        timestamp: firestore.FieldValue.serverTimestamp(),
        ip: getClientIp(req),
        useragent: req.headers["user-agent"],
        uid: req.session.get("uid")
    })
    req.session.set("profile",{...profile, votes})
    await req.session.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

export default withSession(handler);
