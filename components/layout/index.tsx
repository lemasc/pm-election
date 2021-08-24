import { useRouter } from "next/router";
import { ReactNode, ReactNodeArray } from "react";

export default function Layout({
  children,
}: {
  children: ReactNode | ReactNodeArray;
}) {
  const { pathname } = useRouter();
  return (
    <main
      className={`flex flex-1 ${
        pathname.includes("/admin") ? "" : " md:flex-row md:items-start"
      } flex-col items-center justify-center gap-8 md:gap-2 px-2 py-8 text-center bg-gray-50 w-full`}
    >
      {children}
    </main>
  );
}
