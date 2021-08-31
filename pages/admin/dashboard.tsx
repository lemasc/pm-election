import { GetServerSideProps, GetServerSidePropsResult } from "next";
import Head from "next/head";

import Layout from "@/components/layout";
import { useDocument } from "swr-firestore-v9";
import { useEffect, useState } from "react";
import { useWindowWidth } from "@react-hook/window-size/throttled";
import Skeleton from "react-loading-skeleton";
import dayjs from "dayjs";
import th from "dayjs/locale/th";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { SSRContext, withSession } from "@/shared/api/session";
import { getServerConfig, ServerConfig } from "@/shared/api/config";

dayjs.locale(th);
dayjs.extend(localizedFormat);

type VotesSummary = {
  [key: string]: number;
};
type Summary = VotesSummary & {
  timestamp: Date;
  users: number;
};

function Widget({
  show,
  title,
  value,
  color,
}: {
  show: boolean;
  title: string;
  value: number | undefined;
  color?: string;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-2 border rounded p-4 items-center">
      <span>{title}</span>
      <span className={`w-full text-center text-4xl font-bold ${color ? color : "text-green-500"}`}>
        {show ? value : <Skeleton />}
      </span>
    </div>
  );
}

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
    const config = await getServerConfig();
    return {
      props: {
        config,
      },
    };
  }
);

export default function AdminDashboardPage({ config }: { config: ServerConfig }) {
  const width = useWindowWidth({ initialWidth: 768 });
  const [notVoted, setNotVoted] = useState<number | undefined>(undefined);
  const { data } = useDocument<Summary>("/votes/summary", {
    parseDates: ["timestamp"],
    //refreshInterval: 6000 * 2,
  });
  useEffect(() => {
    if (data) {
      const votes = Object.entries(data).reduce((cur, [key, value]) => {
        if (typeof value === "number" && key !== "users") {
          return cur + value;
        }
        return cur;
      }, 0);
      setNotVoted(data.users - votes);
    } else {
      setNotVoted(undefined);
    }
    console.log(data);
  }, [data]);
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>หน้าควบคุม : WPM Election System</title>
      </Head>
      <Layout>
        <div
          className={`${width >= 420 ? "flex-row" : "flex-col"} flex justify-center gap-4 -mt-4`}
        >
          <div className="flex flex-col items-start justify-center flex-grow gap-2">
            <h1 className="font-medium header-font  text-3xl ">แผงควบคุม</h1>
            <span className="text-sm sm:text-base text-gray-800">
              อัพเดทข้อมูลอัตโนมัติทุก 2 นาที
            </span>
          </div>
          <div
            className={`${
              config.inTime || config.canRegister ? "text-green-600" : "text-red-500"
            } text-2xl flex justify-end items-end flex-col sarabun-font font-bold`}
          >
            <span className="text-sm text-gray-600 dark:text-gray-300 kanot-font font-normal py-1.5">
              สถานะของระบบเลือกตั้ง
            </span>
            {config.inTime
              ? "เปิดการลงคะแนน"
              : config.canRegister
              ? "เปิดการลงทะเบียน"
              : "ปิดการลงคะแนน"}
            {(config.maintenance || config.testMode) && (
              <span className="text-xs text-gray-400 kanot-font font-normal py-1.5">
                {config.testMode ? "อยู่ในโหมดทดสอบ" : "อยู่ระหว่างการปรับปรุง"}
              </span>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow">
          <div className="flex md:flex-row flex-col gap-4 md:items-center">
            <div className="flex flex-col flex-grow gap-1">
              <h2 className="text-xl">ภาพรวมการลงคะแนน</h2>
              <span className="text-sm text-gray-500">
                {data
                  ? `เปลี่ยนแปลงล่าสุดเมื่อ ${dayjs(data.timestamp).format("ll LT")} น.`
                  : "กำลังเชื่อมต่อ..."}
              </span>
            </div>
            {data && (
              <span className="flex-shrink-0 font-bold text-purple-600">
                จำนวนผู้ลงทะเบียนทั้งหมด {data.users} คน
              </span>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
            {Array.from(Array(7).keys()).map((i) => {
              return (
                <Widget
                  color={i === 6 ? "text-blue-500" : undefined}
                  show={data !== undefined}
                  title={i === 6 ? "ไม่ประสงค์ลงคะแนน" : "หมายเลข " + (i + 1)}
                  value={data && data[i + 1] ? data[i + 1] : 0}
                  key={i + 1}
                />
              );
            })}
            <Widget
              color="text-red-500"
              show={notVoted !== undefined}
              title="ยังไม่ได้ลงคะแนน"
              value={notVoted}
            />
          </div>
        </div>
      </Layout>
    </div>
  );
}
