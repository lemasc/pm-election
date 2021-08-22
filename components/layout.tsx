import { ReactNode, ReactNodeArray } from "react";

export default function Layout({
  children,
}: {
  children: ReactNode | ReactNodeArray;
}) {
  return (
    <main className="flex flex-1 flex-col md:flex-row items-center md:items-start justify-center gap-8 p-8 text-center bg-gray-50 w-full">
      {children}
    </main>
  );
}
