import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import admin from "../firebase-admin";
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export type ServerConfig = {
  serverTime: number;
  inTime: boolean;
  canRegister: boolean;
  maintenance: boolean;
  testMode: boolean;
};

export type ConfigPageProps = {
  config: ServerConfig;
};

export async function getServerConfig(): Promise<ServerConfig> {
  const date = dayjs().tz("Asia/Bangkok");
  console.log(date.toISOString());
  const t = await admin.remoteConfig().getTemplate();
  function getParam(key: string) {
    return t.parameters[key] && t.parameters[key].defaultValue
      ? JSON.parse((t.parameters[key].defaultValue as any).value)
      : false;
  }
  function testMode(key: string) {
    return getParam("test_mode")
      ? getParam("test_mode")[key] && date.isBefore("2021-09-05")
      : false;
  }
  return {
    serverTime: date.add(1, "minute").valueOf(),
    canRegister: date.isBetween("2021-09-05", "2021-09-08 17:00:00") || testMode("canRegister"),
    inTime: date.isBetween("2021-09-08 08:30:00", "2021-09-08 17:00:00") || testMode("inTime"),
    maintenance: getParam("maintenance"),
    testMode: testMode("canRegister") || testMode("inTime"),
  };
}

export function withConfig<P = any>(handler?: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
    const config = await getServerConfig();

    if (!config.canRegister || (!config.inTime && ctx.req.url?.includes("/select"))) {
      return {
        redirect: {
          destination: "/",
          permanent: true,
        },
      };
    }
    if (config.maintenance) {
      return {
        redirect: {
          destination: "/maintenance",
          permanent: true,
        },
      };
    }
    if (handler) {
      return await handler(ctx);
    }
    if (ctx.req.url?.includes("/profile")) {
      return {
        props: {
          config,
        },
      };
    }
    return {
      props: {},
    };
  };
}
