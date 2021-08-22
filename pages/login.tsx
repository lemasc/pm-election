/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import { useForm } from "react-hook-form";

import Header from "@/components/header";
import Footer from "@/components/footer";
import Layout from "@/components/layout";

type LoginForm = {
  stdID: string;
  stdIDCard?: string;
  captcha?: string;
  haction?: "register_step1";
};

import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { SSRContext, withSession } from "../shared/api";

export const getServerSideProps: GetServerSideProps = withSession(
  async (context: SSRContext): Promise<GetServerSidePropsResult<any>> => {
    context.req.session.unset("profile");
    await context.req.session.save();
    return {
      props: {},
    };
  }
);

export default function Login() {
  const [fetching, setFetch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState(false);
  const [imageSrc, setImage] = useState("/api/captcha");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isValidating },
  } = useForm<LoginForm>();
  async function submit(data: LoginForm) {
    if (!data.stdIDCard) {
      data.stdIDCard = "0000000000000";
    }
    setError(null);
    try {
      setFetch(true);
      await axios.post("/api/login", new URLSearchParams(data));
      router.replace("/profile");
    } catch (err) {
      if (err.response && err.response.status == 403) {
        setError("กรุณาตรวจสอบรหัส Captcha ที่กรอกให้ถูกต้อง");
      } else {
        setError("ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง");
      }
      console.error(err);
    } finally {
      setFetch(false);
    }
  }
  useEffect(() => {
    if (isValidating && error !== null) setError(null);
  }, [isValidating, error]);
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>เข้าสู่ระบบ : WPM Election System</title>
      </Head>
      <Header step={1} desc="เข้าสู่ระบบ" />
      <Layout>
        <h2 className="text-2xl font-bold">เข้าสู่ระบบ</h2>
        {Object.values(errors).length > 0 && (
          <span className="text-red-500 font-bold">
            {Object.values(errors)[0].message}
          </span>
        )}
        {error && (
          <span className="p-4 rounded-lg bg-red-200 text-red-600 font-bold">
            {error}
          </span>
        )}
        <form className="flex flex-col gap-8" onSubmit={handleSubmit(submit)}>
          <div className="sm:grid sm:grid-cols-2 flex flex-col gap-4 text-left items-center">
            <label htmlFor="stdID">รหัสประจำตัวนักเรียน</label>
            <input
              className="input w-64 text-sm"
              type="number"
              placeholder="ป้อนรหัสประจำตัว 5 หลัก"
              {...register("stdID", {
                required: {
                  value: true,
                  message: "กรุณากรอกรหัสประจำตัว",
                },
              })}
            />
            <label htmlFor="stdIDCard">เลขบัตรประชาชน</label>
            <input
              className="input w-64 text-sm"
              type="number"
              placeholder="ป้อนเลขบัตรประชาชน 13 หลัก"
              {...register("stdIDCard", {
                minLength: {
                  value: 13,
                  message:
                    "กรุณากรอกเลขบัตรประชาชนให้ครบ 13 ตัว หากยังไม่ได้ลงทะเบียนให้เว้นว่างไว้",
                },
                maxLength: {
                  value: 13,
                  message:
                    "กรุณากรอกเลขบัตรประชาชนให้ครบ 13 ตัว หากยังไม่ได้ลงทะเบียนให้เว้นว่างไว้",
                },
              })}
            />

            <label htmlFor="captcha">รหัสยืนยันตัวตน (Captcha)</label>
            <div className="flex flex-col gap-4 items-center">
              <img
                className={
                  "border rounded " +
                  (captcha ? "opacity-50 cursor-wait" : "cursor-pointer")
                }
                width={180}
                height={60}
                src={imageSrc}
                title="คลิกเพื่อโหลดใหม่"
                alt="ไม่สามารถโหลด Captcha ได้"
                onClick={() => {
                  setImage("/api/captcha?" + Math.random());
                  setCaptcha(true);
                }}
                onLoad={() => {
                  setCaptcha(false);
                }}
              />
              <input
                className="input w-64 text-sm"
                autoComplete="off"
                type="text"
                placeholder=""
                {...register("captcha", {
                  required: {
                    value: true,
                    message: "กรุณากรอก Captcha",
                  },
                })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <button
              disabled={fetching}
              onClick={() => setError(null)}
              type="reset"
              className="px-4 py-2 btn bg-gray-200 from-gray-200 to-gray-300 ring-gray-300 font-bold"
            >
              รีเซ็ต
            </button>
            <button
              disabled={fetching}
              type="submit"
              className="px-4 py-2 btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500 font-bold text-white"
            >
              ต่อไป
            </button>
          </div>
        </form>
      </Layout>

      <Footer />
    </div>
  );
}
