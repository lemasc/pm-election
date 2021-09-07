import { ReactNode, ReactNodeArray, useEffect, useRef, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import Layout, { appPages } from "./layout";
import Footer, { LOGOUT_PROMPT } from "./layout/footer";
const AuthSpinner = dynamic(() => import("./auth/spinner"));

type WizardProps = {
  children: ReactNode | ReactNodeArray;
};

export default function Wizard({ children }: WizardProps) {
  const [currentPage, setCurrentPage] = useState(-1);
  const router = useRouter();

  function getTitle() {
    const title = ["WPM Election System"];
    const page = appPages && appPages[currentPage];
    if (page !== undefined) {
      title.push(page.name);
    }
    return title.reverse().join(" : ");
  }
  const lastHistoryState = useRef(global.history?.state);
  useEffect(() => {
    const storeLastHistoryState = () => {
      lastHistoryState.current = history.state;
    };
    router.events.on("routeChangeComplete", storeLastHistoryState);
    return () => {
      router.events.off("routeChangeComplete", storeLastHistoryState);
    };
  }, [router.events]);
  /**
   * Route change events in Next.js; a long time issue
   * Currently use https://github.com/vercel/next.js/issues/2476#issuecomment-850030407
   * which could both handle onRouteChange and beforeUnload (popState Hack).
   * However, DOM is reloaded but the React state still there (screen filickering).
   *
   */
  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      (e || window.event).returnValue = LOGOUT_PROMPT;
      return LOGOUT_PROMPT; // Gecko + Webkit, Safari, Chrome etc.
    };
    const beforeRouteHandler = (url: string) => {
      if (router.pathname !== url && url !== "/success" && !confirm(LOGOUT_PROMPT)) {
        // to inform NProgress or something ...
        router.events.emit("routeChangeError");
        // HACK
        const state = lastHistoryState.current;
        if (state != null && history.state != null && state.idx !== history.state.idx) {
          history.go(state.idx < history.state.idx ? -1 : 1);
        }
        // tslint:disable-next-line: no-string-throw
        throw `Route change to "${url}" was aborted (this error can be safely ignored). See https://github.com/zeit/next.js/issues/2476.`;
      }
    };
    if (router.pathname == "/select") {
      window.addEventListener("beforeunload", beforeUnloadHandler);
      router.events.on("routeChangeStart", beforeRouteHandler);
    } else {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      router.events.off("routeChangeStart", beforeRouteHandler);
    }
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      router.events.off("routeChangeStart", beforeRouteHandler);
    };
  }, [router.events, router.pathname]);
  return (
    <>
      <Head>
        <title>{getTitle()}</title>
      </Head>
      {router.pathname !== "/login" && <AuthSpinner />}
      <Layout>
        <div className="text-sm sm:text-base md:p-8 p-4 mx-8 sm:mx-4 flex md:flex-col flex-row flex-wrap md:w-auto border gap-4 bg-white rounded-lg flex-shrink-0">
          {appPages.map((d, i) => {
            if (router.pathname == `/${d.page}` && currentPage !== i) setCurrentPage(i);
            return (
              <div
                className={`flex flex-row gap-4 items-center cursor-default ${
                  i > currentPage ? "text-gray-400" : i == currentPage ? "text-gray-900" : ""
                }`}
                key={d.page}
              >
                <div
                  className={`font-bold border h-10 w-10 md:h-12 md:w-12 flex justify-center items-center rounded-lg text-lg ${
                    i <= currentPage
                      ? i == currentPage
                        ? "bg-gradient-to-b from-purple-500 to-purple-600 text-white shadow-md"
                        : "text-purple-700 bg-gray-50"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="sarabun-font">{d.name}</div>
              </div>
            );
          })}
        </div>
        <div className="shadow-md rounded-lg border bg-white p-8 flex flex-col gap-8 items-center justify-center mx-4">
          {children}
        </div>
      </Layout>
      {appPages.length - 1 !== currentPage && <Footer />}
    </>
  );
}
