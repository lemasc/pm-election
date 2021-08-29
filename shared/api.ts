import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { CookieJar } from "tough-cookie";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
import { withIronSession, Handler, Session } from "next-iron-session";
import { createEmail } from "./authContext";
import admin from "./firebase-admin";
import { CustomServerToken } from "@/types/login";

export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
};

axiosCookieJarSupport(axios);

export type SSRContext = GetServerSidePropsContext & {
  req: GetServerSidePropsContext["req"] & { session: Session };
};

type SSRHandler<P> = (context: SSRContext) => Promise<GetServerSidePropsResult<P>>;

export type NextApiSessionRequest = NextApiRequest & {
  session: Session;
  token?: CustomServerToken;
};

export type SignInResponse = {
  /** A Firebase Auth ID token for the authenticated user. */
  idToken: string;
  /** The email for the authenticated user. */
  email: string;
  /** A Firebase Auth refresh token for the authenticated user. */
  refreshToken: string;
  /** The number of seconds in which the ID token expires. */
  expiresIn: string;
  /** The uid of the authenticated user.*/
  localId: string;
  /** Whether the email is for an existing account.*/
  registered: boolean;
};

/**
 * Mock FirebaseAuth API class Error.
 */
export class FirebaseAuthError extends Error {
  /**
   * The HTTP status code recieved from API
   */
  readonly status: number;
  /**
   * The backend error code associated with this error.
   */
  readonly code: string;
  /**
   * A custom error description.
   */
  readonly message: string;
  /**
   * Converts the API error code into the Firebase JS SDK compatible error codes.
   */
  private generateCode(code: string) {
    let _code: string;
    switch (code) {
      case "EMAIL_NOT_FOUND":
        _code = "invalid-email";
        break;
      case "INVALID_PASSWORD":
        _code = "wrong-password";
        break;
      default:
        _code = code.toLowerCase().split("_").join("-");
    }
    return "auth/" + _code;
  }
  constructor({ code, status }: { code: string; status: number }) {
    super(code);
    this.message = code;
    this.code = this.generateCode(code);
    this.status = status;
  }
}

/**
 * Firebase Sign-in API Promise Wrapper.
 *
 * The Firebase SDK doesn't allow server to verify passwords,
 * so we use generic API endpoint instead.
 * @param sid Target Student ID
 * @param password Unhashed user password
 * @returns Promise fullfilled with the user's account token information.
 */
export const signInPromise = (sid: string, password: string) => {
  return new Promise<SignInResponse>((resolve, reject) =>
    axios
      .post<SignInResponse>(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword",
        {
          email: createEmail(sid),
          password,
          returnSecureToken: true,
        },
        {
          params: {
            key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          },
        }
      )
      .then((d) => resolve(d.data))
      .catch((e) => {
        if (e.response) {
          const response = e.response as AxiosResponse;
          const error = (e.response as AxiosResponse).data.error;
          reject(new FirebaseAuthError({ code: error.message, status: response.status }));
        } else {
          console.error(e);
          reject(e);
          reject(new FirebaseAuthError({ code: "network-request-failed", status: 500 }));
        }
      })
  );
};

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
  handler: Handler<NextApiRequest, NextApiResponse> | SSRHandler<P>
) {
  return withIronSession(handler, sessionOptions);
}

export type JARConfig = CookieJar | boolean | undefined;
function isJar(jar: JARConfig): jar is CookieJar {
  return (jar as CookieJar).toJSON !== undefined;
}

export class APIRequest {
  private req: NextApiSessionRequest;
  private jar: CookieJar;
  /**
   * API Request Helper class
   *
   * Extends the Axios Request with CookieJar support.
   * Cookies will be automatically saved to Iron-Session on the client side.
   *
   * This class doesn't handle saving sessions (Set-Header) for flexibility.
   * You must handle it manually after all APIs are ended.
   * @param req - Next.js API Request (With-Session)
   */
  constructor(req: NextApiSessionRequest) {
    this.req = req;
    this.jar = new CookieJar();
    this.restoreCookie();
  }

  private restoreCookie() {
    const cookies = this.req.session.get("cookies");
    if (cookies) {
      this.jar = CookieJar.deserializeSync(cookies);
    }
  }
  private saveCookie(jar: JARConfig) {
    if (isJar(jar)) {
      this.jar = jar;
      this.req.session.set("cookies", jar.serializeSync());
    }
  }
  private formatConfig(config?: AxiosRequestConfig) {
    return {
      baseURL: "https://wpm.clubth.com/",
      jar: this.jar,
      withCredentials: true,
      ...config,
    };
  }
  async request<T = any>(config: AxiosRequestConfig) {
    const response = await axios.request<T>(this.formatConfig(config));
    this.saveCookie(response.config.jar);
    return response;
  }
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const response = await axios.get<T>(url, this.formatConfig(config));
    this.saveCookie(response.config.jar);
    return response;
  }
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const response = await axios.post(url, data, this.formatConfig(config));
    this.saveCookie(response.config.jar);
    return response;
  }
}

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
