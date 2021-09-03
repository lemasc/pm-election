/* eslint-disable react/display-name */
/* eslint-disable jsx-a11y/alt-text */
import { NextApiSessionRequest, withAPISession } from "@/shared/api/session";
import {
  Font,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  renderToStream,
} from "@react-pdf/renderer";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  DataTableCell,
} from "@david.kucsai/react-pdf-table";
import { NextApiResponse } from "next";
import dayjs, { Dayjs } from "dayjs";
import th from "dayjs/locale/th";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { exportVotes, StudentExportList } from ".";
import { withAuth } from "@/shared/api";
dayjs.locale(th);
dayjs.extend(localizedFormat);

Font.register({
  family: "THSarabunNew",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/sarabun/v8/DtVjJx26TKEr37c9aAFJmg.ttf",
    },
    /*  {
      src: "https://fonts.gstatic.com/s/sarabun/v8/DtVkJx26TKEr37c9aBBxbl8c_SjW.ttf",
      fontStyle: "italic",
    },*/
    {
      src: "https://fonts.gstatic.com/s/sarabun/v8/DtVmJx26TKEr37c9YLJvik8s7g.ttf",
      fontWeight: "bold",
    },
    /*   {
      src: "https://fonts.gstatic.com/s/sarabun/v8/DtVkJx26TKEr37c9aBBxOloc_SjW.ttf",
      fontStyle: "italic",
      fontWeight: "bold",
    },*/
  ],
});

const styles = StyleSheet.create({
  page: { fontFamily: "THSarabunNew", padding: 30, fontSize: "16pt" },
  header: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px",
    padding: "10",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  headerContent: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    marginTop: 5,
    paddingTop: 10,
    paddingBottom: 10,
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  metaItem: {
    textAlign: "center",
    flexDirection: "row",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

const Header = ({ serverUrl }: { serverUrl: string }) => (
  <View style={styles.header}>
    <View style={{ flexShrink: 0, paddingRight: 20, marginTop: -5 }}>
      <Image src={`${serverUrl}/logo.png`} style={{ width: 50, height: 50 }} />
    </View>
    <View style={styles.headerContent}>
      <Text style={{ fontWeight: "bold", fontSize: "18px" }}>
        โรงเรียนมัธยมสาธิตวัดพระศรีมหาธาตุ มหาวิทยาลัยราชภัฏพระนคร
      </Text>
      <Text>รายชื่อนักเรียนที่ลงคะแนนเลือกตั้งประธานนักเรียน ประจำปีการศึกษา 2564</Text>
    </View>
  </View>
);

type MetaProps = {
  name: string;
  value: string;
  width: number;
};
const Meta = ({
  date,
  voted,
  count,
  level,
}: {
  date: Dayjs;
  voted: number;
  count: number;
  level: string;
}) => {
  const meta: MetaProps[] = [
    {
      name: "ระดับชั้น",
      value: `ม.${level}`,
      width: 25,
    },
    {
      name: "เรียกดูข้อมูลเมื่อ",
      value: date.format("lll น."),
      width: 40,
    },
    {
      name: "ลงคะแนนทั้งสิ้น",
      value: `${voted}/${count} คน`,
      width: 35,
    },
  ];
  return (
    <View style={styles.meta}>
      {meta.map(({ name, value, width }, i) => (
        <View key={i} style={{ ...styles.metaItem, width: width + "%" }}>
          <Text style={{ fontWeight: "bold", display: "flex" }}>{name}</Text>
          <Text style={{ marginLeft: 5 }}>{value}</Text>
        </View>
      ))}
    </View>
  );
};
type RowProps = {
  text: string;
  weight?: number;
  left?: boolean;
  value: (v: StudentExportList) => string | number | JSX.Element;
};
const Report = ({
  date,
  serverUrl,
  data,
  level,
}: {
  date: Dayjs;
  serverUrl: string;
  data: StudentExportList[];
  level: string;
}) => {
  let count = 1;
  const rows: RowProps[] = [
    { text: "เลขที่", weight: 0.3, value: () => count++ },
    { text: "รหัสประจำตัว", weight: 0.5, value: (v) => v.id },
    {
      text: "ชื่อ",
      value: (v) => <Text style={{ marginLeft: 5, marginRight: 5 }}>{v.name}</Text>,
      left: true,
    },
    {
      text: "สถานะการลงคะแนน",
      value: (v) => (
        <Text style={{ color: v.vote ? "green" : "red" }}>
          {v.vote ? "ลงคะแนนแล้ว" : "ยังไม่ได้ลงคะแนน"}
        </Text>
      ),
    },
  ];
  const software = "Lemasc PDF Creator v1.0";
  return (
    <Document pdfVersion="1.7" creator={software} producer={software}>
      <Page size="A4" style={styles.page}>
        <Header serverUrl={serverUrl} />
        <Meta voted={data.filter((v) => v.vote).length} count={data.length} {...{ date, level }} />
        <View>
          <Table data={data}>
            <TableHeader textAlign="center" fontSize="16">
              {rows.map(({ text, weight }, i) => (
                <TableCell key={i} style={{ fontWeight: "bold" }} weighting={weight as number}>
                  {text}
                </TableCell>
              ))}
            </TableHeader>
            <TableBody fontSize="16" textAlign="center">
              {rows.map(({ value, left, weight }, i) => (
                <DataTableCell
                  weighting={weight}
                  key={i}
                  style={{
                    ...(left ? { textAlign: "left" } : undefined),
                  }}
                  getContent={value}
                />
              ))}
            </TableBody>
          </Table>
        </View>
      </Page>
    </Document>
  );
};

const exportPDF = async (req: NextApiSessionRequest, res: NextApiResponse) => {
  if (req.method !== "GET" || !req.query || !req.query.class || !req.query.room)
    return res.status(400).json({ success: false });
  if (!req.session.get("admin")) return res.status(403).json({ success: false });
  const data = await exportVotes(req);
  if (data.length === 0) return res.status(404).send({ success: false });

  const serverUrl =
    (req.headers.host?.includes("localhost") ? "http" : "https") + "://" + req.headers.host;
  const level = [parseInt(req.query.class as string), parseInt(req.query.room as string)];
  try {
    const date = dayjs();
    const stream = await renderToStream(
      <Report level={`${level.join("/")}`} {...{ data, date, serverUrl }} />
    );
    res.setHeader("Content-Transfer-Encoding", "Binary");
    res.setHeader("Content-type", "application/pdf");
    res.setHeader(
      "Content-disposition",
      `attachment; filename=VotesExport_${level.join("0")}_${date.format("YYYYMMDD_HHmmss")}.pdf`
    );
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false });
  }
};
export default withAPISession(exportPDF);
