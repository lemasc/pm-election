import { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useWindowWidth } from "@react-hook/window-size/throttled";

import { Candidate, getCandidates } from "@/shared/candidates";
import Layout from "@/components/layout";

export const getStaticProps: GetStaticProps<{
  candidates: Candidate[];
}> = async () => {
  try {
    const candidates = await getCandidates(true);
    return { props: { candidates } };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

export default function CandidatesPage({
  candidates: data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const width = useWindowWidth();
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>ผู้ลงสมัคร : WPM Election System</title>
      </Head>
      <Layout>
        <h2 className="text-2xl md:text-3xl">ผู้ลงสมัครประธานนักเรียน</h2>
        <div className="flex flex-col sm:flex-row flex-wrap 2xl:grid-cols-4 gap-8 py-6 md:px-6 items-center justify-center">
          {data &&
            data.map((c) => (
              <Link key={c.index} href={`/candidates/${c.index}`}>
                <a className="border rounded bg-white hover:bg-gray-100 shadow max-w-xs">
                  <Image
                    src={`/candidates/${c.index}.jpg`}
                    alt={c.name}
                    width={320}
                    height={320}
                  />
                  <div className="flex flex-row p-6 text-gray-500 gap-4 text-sm items-start justify-center">
                    <div className="flex flex-col flex-grow gap-2 flex-shrink-0">
                      <h3 className="font-bold text-black text-lg">
                        {c.title}
                        {c.name} {c.surname}
                      </h3>
                      <span>ชั้นมัธยมศึกษาปีที่ {c.class}</span>
                    </div>
                    <div className="flex flex-col items-end justify-start">
                      <span>หมายเลข</span>
                      <span className="text-blue-600 text-2xl font-bold">
                        {c.index}
                      </span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
        </div>
      </Layout>
    </div>
  );
}
