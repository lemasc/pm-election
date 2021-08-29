import type { NextApiResponse } from "next";
import axios from "axios";
import { getClientIp } from "@supercharge/request-ip";
import { firestore } from "firebase-admin";

import { withSession, NextApiSessionRequest, withAuth } from "@/shared/api";
import admin from "@/shared/firebase-admin";
import { LoginResult } from "@/types/login";
import { createSID } from "@/shared/authContext";
import { Candidate, CandidateDatabase } from "@/shared/candidates";
import { noCandidate } from "../select";
import { checkParameters } from "./login";

async function verifyRecaptcha(req: NextApiSessionRequest) {
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      new URLSearchParams({
        secret: process.env.RECAPTCHA as string,
        response: req.body.token as string,
        remoteip: getClientIp(req) as string,
      })
    );
    return response.data && response.data.success;
  } catch (err) {
    return false;
  }
}
async function handler(req: NextApiSessionRequest, res: NextApiResponse) {
  try {
    if (!req.token || !checkParameters(req.body, ["id", "token"]))
      return res.status(400).json({ success: false });

    // Verify reCapthcha and index
    const cdb = new CandidateDatabase(req);
    const candidate: Candidate | null =
      req.body.id === "7" ? noCandidate : await cdb.getCandidate(req.body.id as string, true);
    if (!(await verifyRecaptcha(req)) || !candidate)
      return res.status(403).json({ success: false });
    const db = admin.firestore();
    const votesRef = db.collection("votes").doc(req.token.uid);
    if ((await votesRef.get()).exists) {
      return res.status(409).json({ success: false });
    }
    const votes = {
      name: candidate.title + candidate.name + " " + candidate.surname,
      selected: parseInt(req.body.id),
    };
    const profile: LoginResult = {
      stdID: createSID(req.token.email as string),
      stdName: req.token.name,
      stdNo: req.token.no,
      stdClass: req.token.class,
    };
    await votesRef.set({
      ...votes,
      ...profile,
      timestamp: firestore.FieldValue.serverTimestamp(),
      ip: getClientIp(req),
      useragent: req.headers["user-agent"],
    });
    req.session.set("profile", { ...profile, votes });
    await req.session.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

export default withAuth(withSession(handler));
