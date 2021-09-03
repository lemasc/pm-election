import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import "../styles/content.css";
import type { AppProps } from "next/app";
//import LogRocket from "logrocket";
import MainProvider from "@/shared/provider";

function MyApp({ Component, pageProps }: AppProps) {
  //LogRocket.init("y60w1s/election");
  return (
    <MainProvider>
      <Component {...pageProps}></Component>
    </MainProvider>
  );
}
export default MyApp;
