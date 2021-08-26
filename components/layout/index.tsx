import { useRouter } from "next/router";
import { ReactNode, ReactNodeArray } from "react";
import MenuBarComponent from "./menubar";

const appPaths = ["login", "profile", "select", "success"];

export default function Layout({
  children,
}: {
  children: ReactNode | ReactNodeArray;
}) {
  const { pathname } = useRouter();

  const isSelectApp = appPaths.map((a) => "/" + a).includes(pathname);
  return (
    <>
      <MenuBarComponent isSelectApp={isSelectApp} />
      <main
        className={`mt-20 flex flex-1 ${
          isSelectApp
            ? "md:flex-row md:items-start md:gap-2 justify-center items-center px-2 text-center gap-8"
            : "md:px-20 px-8 gap-4 mb-10"
        } flex-col py-8 bg-gray-50 w-full`}
      >
        {children}
      </main>
    </>
  );
}
