import type { NextApiHandler, NextApiResponse } from "next";
import admin from "../firebase-admin";
import { CustomServerToken } from "@/types/login";
import { NextApiSessionRequest } from "./session";

export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
};

/**
 * withAuth API wrapper function.
 *
 * Protect API routes by verifying the Firebase ID tokens recieved from the Authorization header.
 */
export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiSessionRequest, res: NextApiResponse<APIResponse>): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false });
    }
    const auth = admin.auth();
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(token, true);
      if (!decodedToken || !decodedToken.uid) return res.status(401).json({ success: false });
      req.token = decodedToken as CustomServerToken;
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false });
    }
    return handler(req, res);
  };
}
