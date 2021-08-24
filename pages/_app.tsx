import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import MainProvider from "@/shared/provider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MainProvider>
      <Component {...pageProps}></Component>
    </MainProvider>
  );
}
export default MyApp;
