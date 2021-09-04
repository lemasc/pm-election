import Head from "next/head";

import Layout from "@/components/layout";
import Instructions from "@/components/instructions";

export default function InstructionsPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Head>
        <title>ขั้นตอนการใช้งาน : WPM Election System</title>
      </Head>
      <Layout>
        <h2 className="text-2xl md:text-3xl">ขั้นตอนการลงคะแนน</h2>
        <Instructions />
      </Layout>
    </div>
  );
}
