import { CookieJar } from "tough-cookie";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
import { NextApiSessionRequest } from "./session";

axiosCookieJarSupport(axios);

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
