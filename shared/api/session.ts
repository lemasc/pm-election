import { CustomServerToken } from "@/types/login";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { withIronSession, Handler, Session } from "next-iron-session";

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: "election",
  ttl: 60 * 15 + 60,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxage: -1,
  },
};

export function withSession<P extends { [key: string]: any } = { [key: string]: any }>(
  handler: SSRHandler<P>
) {
  return withIronSession(handler, sessionOptions);
}

export function withAPISession<P extends { [key: string]: any } = { [key: string]: any }>(
  handler: Handler<NextApiSessionRequest, NextApiResponse<P>>
) {
  return withIronSession(handler, sessionOptions);
}

export type SSRContext = GetServerSidePropsContext & {
  req: GetServerSidePropsContext["req"] & { session: Session };
};

type SSRHandler<P> = (context: SSRContext) => Promise<GetServerSidePropsResult<P>>;

export type NextApiSessionRequest = NextApiRequest & {
  session: Session;
  token?: CustomServerToken;
};
