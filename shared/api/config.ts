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
};

export async function getServerConfig(): Promise<ServerConfig> {
  const date = dayjs().tz("Asia/Bangkok");
  const t = await admin.remoteConfig().getTemplate();
  function getParam(key: string) {
    console.log(t.parameters[key].defaultValue);
    return t.parameters[key] && t.parameters[key].defaultValue
      ? JSON.parse((t.parameters[key].defaultValue as any).value)
      : false;
  }
  const test_mode = !getParam("test_mode") && date.isBefore("2021-09-05");
  return {
    serverTime: date.add(1, "minute").valueOf(),
    canRegister: date.isBetween("2021-09-05", "2021-09-08 17:00:00") || test_mode,
    inTime: date.isBetween("2021-09-08 08:30:00", "2021-08-08 17:00:00") || test_mode,
    maintenance: getParam("maintenance"),
  };
}

export function withConfig<P extends { [key: string]: any } = { [key: string]: any }>(
  handler?: GetServerSideProps<P>
) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
    const config = await getServerConfig();
    if (!config.canRegister) {
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
    return {
      props: {},
    };
  };
}
