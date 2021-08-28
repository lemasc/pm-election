import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import { LoginForm } from "@/types/login";
import { useAuth } from "@/shared/authContext";
import Wizard from "@/components/wizard";
import { IDCardInput, IDInput } from "@/components/auth/inputs";
import Image from "next/image";
const ModalComponent = dynamic(() => import("@/components/layout/modal"));

const CAPTCHA_ERROR = "Captcha ไม่ถูกต้อง กรุณากรอกใหม่อีกครั้ง";
const CREDENTIALS_ERROR =
  "ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง";

export default function LoginPage() {
  const { signIn, signInNative } = useAuth();
  const [fetching, setFetch] = useState(false);
  const [prompt, showPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState(false);
  const [imageSrc, setImage] = useState("/api/captcha");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValidating },
  } = useForm<LoginForm>({
    reValidateMode: "onSubmit",
  });

  async function _signUp(data: LoginForm) {
    setFetch(true);
    if (!data.captcha) {
      setFetch(false);
      return showPrompt(true);
    }
    const result = await signInNative(data);
    if (!result.success && result.message) {
      setFetch(false);
      switch (result.message) {
        case "invalid-captcha":
          resetCaptcha(true);
          showPrompt(true);
          return setError(CAPTCHA_ERROR);
        case "invalid-credentials":
          return setError(CREDENTIALS_ERROR);
      }
    } else {
      await _signIn(data);
    }
  }
  async function _signIn(data: LoginForm) {
    if (!data.stdIDCard) {
      data.stdIDCard = "0000000000000";
    }
    setError(null);
    setFetch(true);
    router.prefetch("/profile");
    const result = await signIn(data.stdID, data.stdIDCard);
    if (!result.success && result.message) {
      switch (result.message) {
        case "auth/user-not-found":
          return await _signUp(data);
        case "auth/network-request-failed":
          setError("ไม่สามารถเข้าสู่ระบบได้");
          break;
        case "auth/wrong-password":
          setError(CREDENTIALS_ERROR);
          break;
        default:
          setError(
            "ไม่สามารถเข้าสู่ระบบได้ เนื่องจาก " +
              result.message.replace("auth/", "")
          );
      }
    } else {
      router.replace("/profile");
    }
    setFetch(false);
  }
  useEffect(() => {
    if (isValidating && error !== null) setError(null);
  }, [isValidating, error]);

  function resetCaptcha(resetValues?: boolean) {
    if (resetValues) {
      setValue("captcha", "");
    }
    setImage("/api/captcha?" + Math.random());
    setCaptcha(true);
  }
  function submitPrompt() {
    if (watch("captcha")?.trim() !== "") {
      showPrompt(false);
      handleSubmit(_signIn)();
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Wizard>
        <h2 className="text-2xl">เข้าสู่ระบบ</h2>
        {Object.values(errors).length > 0 && (
          <span className="text-red-500 font-bold">
            {Object.values(errors)[0].message}
          </span>
        )}
        {error && error != CAPTCHA_ERROR && (
          <span className="p-4 rounded-lg bg-red-200 text-red-600 font-bold">
            {error}
          </span>
        )}
        <form className="flex flex-col gap-8" onSubmit={handleSubmit(_signIn)}>
          <div className="sm:grid sm:grid-cols-2 flex flex-col gap-4 text-left items-center">
            <label htmlFor="stdID">รหัสประจำตัวนักเรียน</label>
            <IDInput register={register} className="w-64" />
            <label htmlFor="stdIDCard">เลขบัตรประชาชน</label>
            <IDCardInput register={register} className="w-64" />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <button
              disabled={fetching}
              onClick={() => setError(null)}
              type="reset"
              className="px-4 py-2 btn bg-gray-200 from-gray-200 to-gray-300 ring-gray-300"
            >
              รีเซ็ต
            </button>
            <button
              disabled={fetching}
              type="submit"
              className="px-4 py-2 btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 text-white"
            >
              ต่อไป
            </button>
          </div>
        </form>
        <span className="text-sm text-gray-500">
          การใช้งานระบบเลือกตั้งนี้ ถือว่าคุณได้ยอมรับ{" "}
          <Link href="/terms">
            <a className="underline text-blue-600 hover:text-blue-700">
              ข้อตกลงการใช้งาน
            </a>
          </Link>{" "}
          และ{" "}
          <Link href="/privacy">
            <a className="underline text-blue-600 hover:text-blue-700">
              นโยบายความเป็นส่วนตัว
            </a>
          </Link>{" "}
          แล้ว
        </span>
        <ModalComponent
          show={prompt}
          closable={true}
          size="max-w-md"
          onClose={() => showPrompt(false)}
          title="ป้อน Captcha"
          titleClass="border-b bg-blue-500 text-white text-base"
          onEnter={() => resetCaptcha()}
        >
          <div className="p-4 flex flex-col gap-4 text-sm">
            <label htmlFor="captcha">
              เพื่อความปลอดภัย กรุณาป้อนรหัสยืนยันตัวตนที่ปรากฏบนภาพ (Captcha)
            </label>
            {error && error == CAPTCHA_ERROR && (
              <span className="text-red-600 font-bold">{CAPTCHA_ERROR}</span>
            )}
            <div className="flex flex-col gap-4 items-center">
              <Image
                className={
                  "border rounded " +
                  (captcha ? "opacity-50 cursor-wait" : "cursor-pointer")
                }
                width={180}
                height={60}
                src={imageSrc}
                title="คลิกเพื่อโหลดใหม่"
                alt="ไม่สามารถโหลด Captcha ได้"
                onClick={() => resetCaptcha()}
                onLoad={() => {
                  setCaptcha(false);
                }}
              />
              <input
                className="input w-64 text-sm"
                autoComplete="off"
                type="text"
                placeholder=""
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitPrompt();
                  }
                }}
                {...register("captcha")}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => showPrompt(false)}
                className="px-4 py-2 btn bg-gray-200 from-gray-200 to-gray-300 ring-gray-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => submitPrompt()}
                type="submit"
                className="px-4 py-2 btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 text-white"
              >
                ตกลง
              </button>
            </div>
          </div>
        </ModalComponent>
      </Wizard>
    </div>
  );
}
