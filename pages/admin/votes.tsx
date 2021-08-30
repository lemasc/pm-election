import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import Layout from "@/components/layout";
import { useDocument } from "swr-firestore-v9";
import { useEffect, useState } from "react";
import { useWindowWidth } from "@react-hook/window-size/throttled";
import dayjs from "dayjs";
import th from "dayjs/locale/th";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "@/shared/authContext";
import Loader from "react-loader-spinner";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { SSRContext, withSession } from "@/shared/api/session";

dayjs.locale(th);
dayjs.extend(localizedFormat);

type VotesSearch = {
  class: number;
  room: number;
};

type ExportResult = Partial<VotesSearch> & {
  data: Array<string | boolean>[];
};

export const getServerSideProps: GetServerSideProps = withSession(
  async (context: SSRContext): Promise<GetServerSidePropsResult<{}>> => {
    if (!context.req.session.get("admin")) {
      return {
        redirect: {
          destination: "/admin/login",
          permanent: true,
        },
      };
    }
    return {
      props: {},
    };
  }
);

export default function AdminVotesPage() {
  const { user } = useAuth();
  const [fetching, setfetching] = useState(false);
  const [result, setResult] = useState<ExportResult>({ data: [] });
  const { register, handleSubmit, watch, setValue } = useForm<VotesSearch>();
  async function onSubmit(form: VotesSearch) {
    if (!user || fetching) return;
    try {
      setfetching(true);
      setResult({
        ...form,
        data: (
          await axios.post("/api/votes", form, {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`,
            },
          })
        ).data,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setfetching(false);
    }
  }

  useEffect(() => {
    if (watch("class") >= 4 && watch("room") == 4) {
      setValue("room", 1);
    }
  }, [setValue, watch]);
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>การลงคะแนน : WPM Election System</title>
      </Head>
      <Layout>
        <div className={`flex-row flex justify-center gap-4`}>
          <div className="flex flex-col items-start justify-center flex-grow gap-2">
            <h1 className="font-medium header-font text-3xl ">รายชื่อการลงคะแนน</h1>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow mt-4">
          <form
            className="flex flex-col sm:flex-row flex-grow gap-6 items-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col flex-grow gap-1 text-center sm:text-left">
              <h2 className="text-xl flex-grow">เรียกดูข้อมูล</h2>
              {!fetching && result.data.length > 0 && (
                <span className="text-sm text-gray-500">
                  แสดงผลทั้งหมด {result.data.length} รายการ
                </span>
              )}
            </div>
            <div className="flex flex-row flex-wrap gap-4 justify-center">
              <div className="flex flex-row gap-4 text-center items-center">
                <label>ระดับชั้น</label>
                <select
                  disabled={fetching}
                  className="input"
                  {...register("class", {
                    required: true,
                    valueAsNumber: true,
                  })}
                >
                  {Array.from(Array(6).keys()).map((i) => (
                    <option key={i} value={i + 1}>
                      ม.{i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row gap-4 text-center items-center">
                <label>ห้อง</label>
                <select
                  disabled={fetching}
                  className="input"
                  {...register("room", {
                    required: true,
                    valueAsNumber: true,
                  })}
                >
                  {Array.from(Array(watch("class") >= 4 ? 3 : 4).keys()).map((i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              disabled={fetching}
              className="btn from-apple-500 to-apple-500 bg-apple-500 text-white px-8 py-2 ring-apple-500"
            >
              ค้นหา
            </button>
          </form>
        </div>
        {(result.data.length > 0 || fetching) && (
          <div
            className={`bg-white rounded border shadow ${
              fetching ? "p-6 sm:p-8" : "sm:p-8 p-6"
            } flex flex-col gap-4 flex-grow items-center justify-center`}
          >
            {fetching ? (
              <Loader type="TailSpin" color="#48bb4a" />
            ) : (
              <div className="overflow-x-auto w-full">
                <table>
                  <thead>
                    <tr>
                      <th>เลขประจำตัว</th>
                      <th>ชื่อ-นามสกุล</th>
                      <th className="hidden sm:table-cell">ระดับชั้น</th>
                      <th>เลขที่</th>
                      <th>สถานะบัญชี</th>
                      <th>สถานะการลงคะแนน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map(([id, name, acc, vote], i) => (
                      <tr key={i}>
                        <td>{id}</td>
                        <td className="text-left sm:text-center">{name}</td>
                        <td className="hidden sm:table-cell">
                          ม. {`${result.class}/${result.room}`}
                        </td>
                        <td>{i + 1}</td>
                        <td className={`italic ${acc ? "text-green-500" : "text-red-500"}`}>
                          {acc ? "ลงทะเบียนแล้ว" : "ยังไม่ได้ลงทะเบียน"}
                        </td>
                        <td
                          className={`font-bold ${
                            vote ? "font-bold text-green-600" : "text-red-600"
                          }`}
                        >
                          {vote ? "ลงคะแนนแล้ว" : "ยังไม่ได้ลงคะแนน"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Layout>
    </div>
  );
}
