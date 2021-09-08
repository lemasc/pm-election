import Head from "next/head";
import Image from "next/image";
import Logo from "../../public/logo.png";
import { IDInput, IDCardInput } from "@/components/auth/inputs";
import { useForm } from "react-hook-form";
import { LoginForm } from "@/types/login";
import { useAuth } from "@/shared/authContext";
import instance from "@/shared/request";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AdminLoginPage(): JSX.Element {
  const router = useRouter();
  const [fetching, setFetch] = useState(false);
  const { signIn, user } = useAuth();
  const { register, handleSubmit } = useForm<LoginForm>();
  async function submit(data: LoginForm) {
    setFetch(true);
    const result = await signIn(data.stdID, data.stdIDCard);
    if (!result.success) {
      let message = "ไม่สามารถเข้าสู่ระบบได้";
      switch (result.message) {
        case "auth/user-not-found":
          message = "ไม่พบผู้ใช้";
          break;
        case "auth/wrong-password":
          message = "ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง";
      }
      setFetch(false);
      return alert(message);
    }
  }
  useEffect(() => {
    (async () => {
      if (fetching && user) {
        try {
          await instance(user).get("/api/admin");
          router.replace("/admin/dashboard");
        } catch (err) {
          console.error(err);
          alert("ไม่สามารถเข้าสู่ระบบได้");
          setFetch(false);
        }
      }
    })();
  }, [fetching, user, router]);

  return (
    <div
      className={
        "justify-center overflow-hidden min-h-screen flex flex-col items-center dark:bg-gray-900 dark:text-white"
      }
    >
      <Head>
        <title>Backend Login : WPM Election System</title>
      </Head>
      <main className="flex flex-1 justify-center items-center w-full bg-gray-50">
        <div className="mx-6 rounded-lg border shadow-xl flex flex-col bg-white text-black items-center justify-start space-y-4">
          <div className="px-4 pt-4">
            <Image src={Logo} alt="Logo" width={75} height={75} />
          </div>
          <form
            onSubmit={handleSubmit(submit)}
            className="flex flex-col border-t bg-gray-50 p-8 gap-4 mx-4 w-full max-w-sm"
          >
            <h1 className="text-2xl header-font mr-8">เข้าสู่ระบบจัดการ</h1>
            <div className="flex flex-col gap-1 space-y-1">
              <label htmlFor="stdID" className="text-sm">
                รหัสประจำตัวนักเรียน
              </label>
              <IDInput className="w-full text-left" register={register} />
            </div>
            <div className="flex flex-col gap-1 space-y-1">
              <label htmlFor="stdIDCard" className="text-sm">
                เลขบัตรประชาชน
              </label>
              <IDCardInput className="w-full text-left" register={register} />
            </div>
            <button
              type="submit"
              disabled={fetching}
              className="mt-2 text-white btn px-4 py-2 ring-apple-500 bg-apple-500 from-apple-500 to-apple-600 disabled:bg-gray-200"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
