import Link from "next/link";
import Image from "next/image";
import { Candidate } from "@/shared/candidates";
export default function CandidateList({ data }: { data: Candidate[] }) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap 2xl:grid-cols-4 gap-8 items-center justify-center">
      {data &&
        data.map((c) => (
          <Link key={c.index} href={`/candidates/${c.index}`}>
            <a className="border rounded bg-white hover:bg-gray-100 shadow max-w-xs">
              <Image
                src={`/data/${c.index}/${c.index}.jpg`}
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
                  <span className="text-blue-600 text-2xl font-bold">{c.index}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
    </div>
  );
}
