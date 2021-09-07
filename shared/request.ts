import axios from "axios";
import { User } from "firebase/auth";
import ReCAPTCHA from "react-google-recaptcha";
import * as rax from "retry-axios";

export const RETRY_MSG = "การดำเนินการใช้เวลานานกว่าที่คิดไว้ กรุณารอสักครู่...";

const _instance = axios.create();
_instance.defaults.raxConfig = {
  retry: 2,
  retryDelay: 1000,
  httpMethodsToRetry: ["GET", "HEAD", "OPTIONS", "DELETE", "PUT", "POST"],
  instance: _instance,
};
rax.attach(_instance);

/**
 * Axios instance that handles authorization and retry on error.
 * @param {user} user - Firebase user object
 * @param {() => void} onRetry - onRetry function
 * @returns Custom Axios Instance
 */
const instance = (user?: User, onRetry?: () => void, recaptcha?: ReCAPTCHA | null) => {
  _instance.interceptors.request.use(async (config) => {
    if (user) {
      config.headers = {
        Authorization: `Bearer ${await user.getIdToken()}`,
      };
    }
    if (onRetry) {
      config.raxConfig = {
        ...config.raxConfig,
        onRetryAttempt: onRetry,
      };
    }
    if (recaptcha) {
      const params = new URLSearchParams(config.data);
      const token = await recaptcha?.executeAsync();
      params.set("token", token as string);
      config.data = params;
    }
    return config;
  });
  return _instance;
};
export default instance;
