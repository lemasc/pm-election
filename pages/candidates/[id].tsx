import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
  ChatAlt2Icon,
  LightBulbIcon,
} from "@heroicons/react/outline";

import { CandidateDatabase, CandidateWithContent } from "@/shared/candidates";
import Layout from "@/components/layout";
import MarkDownComponent from "@/components/markdown";

export const getStaticPaths: GetStaticPaths = async () => {
  const db = new CandidateDatabase();
  const folders = await db.getFolders();
  return {
    paths: folders.map((folder) => ({ params: { id: folder } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<{
  candidate: CandidateWithContent;
}> = async ({ params }) => {
  if (!params)
    return {
      notFound: true,
    };
  const db = new CandidateDatabase();
  const candidate = (await db.getCandidate(params.id as string)) as CandidateWithContent;
  if (!candidate)
    return {
      notFound: true,
    };
  return { props: { candidate } };
};

export default function CandidatePage({
  candidate: data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>ข้อมูลผู้ลงสมัคร : WPM Election System</title>
      </Head>
      <Layout>
        {data && (
          <>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col gap-6 flex-grow">
                <div className="flex flex-row gap-6">
                  <Link href="/candidates">
                    <a title="กลับไปยังหน้ารายการผู้ลงสมัคร">
                      <ArrowLeftIcon className="h-8 w-8 mt-0.5" />
                    </a>
                  </Link>
                  <div className="flex flex-col gap-2 flex-grow text-lg">
                    <h2 className="text-2xl md:text-3xl">
                      {data.title}
                      {data.name} {data.surname} ({data.nickname})
                    </h2>
                    <div className=" text-gray-500">ชั้นมัธยมศึกษาปีที่ {data.class}</div>
                    <div className="text-blue-500 font-bold">ผู้สมัครหมายเลข {data.index}</div>
                  </div>
                </div>
                <div className="bg-white rounded p-6 border flex flex-col">
                  <h3 className="font-bold text-lg text-purple-600">
                    <AcademicCapIcon className="inline h-8 w-8 mr-2 -mt-1.5" />
                    ประวัติการศึกษา
                  </h3>
                  <div className="flex flex-col pt-3 gap-2">
                    {Object.entries(data.education).map(([key, value]) => (
                      <div className="flex flex-col md:flex-row gap-1" key={key}>
                        <span className="flex-grow break-words">{key}</span>
                        {value !== 0 && (
                          <span className="text-gray-500 font-bold flex-shrink-0">
                            เกรดเฉลี่ย <span className="ml-2">{value.toFixed(2)}</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <figure className="w-full md:w-auto md:max-w-sm border bg-white gap-6 md:gap-2 rounded p-4 flex-shrink-0 flex md:flex-col items-center justify-center text-center self-start">
                <div>
                  <Image
                    className="rounded-full"
                    src={`/data/${data.index}/${data.index}.jpg`}
                    alt={data.name}
                    width={125}
                    height={125}
                  />
                </div>
                <figcaption className="flex flex-col gap-2">
                  <span className="font-bold text-lg text-purple-600">คติประจำใจ</span>
                  <blockquote className="relative mx-4 text-gray-800" style={{ minWidth: "8rem" }}>
                    <span className="absolute -top-6 -left-4 text-gray-400 text-4xl">“</span>
                    {data.motto}
                    <span className="absolute -top-6 -right-4 text-gray-400 text-4xl">”</span>
                  </blockquote>
                </figcaption>
              </figure>
            </div>
            <div className="bg-white rounded p-6 border">
              <h3 className="font-bold text-lg text-purple-600 pb-2">
                <LightBulbIcon className="inline h-8 w-8 mr-2 -mt-1.5" />
                ความสามารถพิเศษ
              </h3>
              <div className="content">
                <ul>
                  {data.abilities.map((d, i) => (
                    <li key={i}>
                      <div className="content-sublist">{d}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {data.experience && (
              <div className="bg-white rounded p-6 border">
                <h3 className="font-bold text-lg text-purple-600 pb-2">
                  <BriefcaseIcon className="inline h-8 w-8 mr-2 -mt-1.5" />
                  ประสบการณ์และกิจกรรมที่ผ่านมา
                </h3>
                <MarkDownComponent content={data.experience} />
              </div>
            )}
            {data.policy && (
              <div className="bg-white rounded p-6 border">
                <h3 className="font-bold text-lg text-purple-600 pb-2">
                  <ChatAlt2Icon className="inline h-8 w-8 mr-2 -mt-1.5" />
                  นโยบาย
                </h3>
                <MarkDownComponent content={data.policy} />
              </div>
            )}
          </>
        )}
      </Layout>
    </div>
  );
}
