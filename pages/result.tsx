import Head from "next/head";
import Image from "next/image";
import Layout from "@/components/layout";
import { GetServerSideProps } from "next";
import { withSession } from "@/shared/api/session";
import { withConfig } from "@/shared/api/config";
import { Candidate, CandidateDatabase } from "@/shared/candidates";
import { useDocument } from "swr-firestore-v9";
import { Summary } from "@/types/login";
import { noCandidate } from "./select";

type ServerProps = {
  candidates: Candidate[];
};

export const getServerSideProps: GetServerSideProps<ServerProps> = withSession(async ({ req }) => {
  const db = new CandidateDatabase(req);
  const candidates = await db.getCandidates(true);

  return {
    props: {
      candidates,
    },
  };
});

export default function ResultsPage({ candidates }: ServerProps) {
  const { data } = useDocument<Summary>("/votes/summary", {
    parseDates: ["timestamp"],
  });
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>ผลการลงคะแนน : WPM Election System</title>
      </Head>
      <Layout>
        <div className="flex sm:flex-row flex-col gap-4 sm:items-center">
          <div className="flex flex-col flex-grow gap-1">
            <h2 className="text-3xl">ผลการลงคะแนน</h2>
          </div>
          {data && (
            <div className="flex flex-col text-right gap-1">
              <span className="flex-shrink-0 font-bold text-green-600">
                จำนวนผู้ลงทะเบียนทั้งหมด {data.users - 10} คน
              </span>
              <span className="text-sm text-gray-500">
                คิดเป็น {((data.users * 100) / 947).toFixed(2)}% ของนักเรียนทั้งหมด
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col lg:grid lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {data &&
            candidates &&
            [3, 2, 1, 6, 4, 7, 5].map((d, i) => {
              const c = d === 7 ? noCandidate : candidates[d - 1];
              if (!c) return null;
              return (
                <div
                  className={`${
                    i === 0 ? "bg-blue-500 bg-opacity-80 text-white" : "bg-white"
                  } rounded shadow py-6 pr-6 border flex flex-row flex-wrap p-4 gap-4 justify-center w-full"`}
                  key={c.index}
                >
                  <div className="flex sm:flex-row flex-col gap-4 w-full flex-grow">
                    <div className="flex">
                      <div className="flex-shrink-0 flex-grow">
                        <Image
                          className="rounded-full bg-gray-200"
                          src={`/data/${c.index}/${c.index}.jpg`}
                          alt={c.name}
                          width={75}
                          height={75}
                        />
                      </div>
                      <div className="flex flex-col items-end text-sm sm:hidden">
                        <span className={`font-bold text-3xl ${i === 0 ? "" : "text-blue-500"}`}>
                          {data[d]}
                        </span>
                        <span>คน</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-grow justify-center">
                      <h3 className="text-lg font-bold">
                        {c.title}
                        {c.name} {c.surname}
                      </h3>
                      <span>หมายเลข {c.index}</span>
                    </div>
                    <div className="sm:flex flex-col items-end text-sm hidden justify-center">
                      <span className={`font-bold text-3xl ${i === 0 ? "" : "text-blue-500"}`}>
                        {data[d]}
                      </span>
                      <span>คน</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Layout>
    </div>
  );
}
