import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ORG_STRUCTURE, SPEAKER_TYPES } from "@/survey/types";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db, withRetry } from "@/lib/firebase";
import { formatThaiTime } from "@/survey/surveyUtils";

const labelFrom = (list: { value: string; label: string }[], v: string) => list.find((x) => x.value === v)?.label ?? v;

const getDeptName = (bureau: string, div: string) => {
  const b = ORG_STRUCTURE.find((x) => x.value === bureau);
  const d = b?.divisions?.find((x) => x.value === div);
  if (d) return `${b?.label} (${d.label})`;
  return b?.label || bureau;
};
const bureauName = (bureau: string) => ORG_STRUCTURE.find((x) => x.value === bureau)?.label || bureau || "ไม่ระบุหน่วยงาน";
const urgencyText = (u: string) => (u === "high" ? "สูง" : u === "medium" ? "ปานกลาง" : "ต่ำ");
const num = (v: any) => parseInt(v) || 0;
const thaiDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
};

const OfficialReport = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ orgName: "", surveyTitle: "", openDate: "", closeDate: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withRetry(() => getDocs(collection(db, "surveys")))
      .then((snapshot) => setRequests(snapshot.docs.map((d) => d.data())))
      .catch((err) => console.error("Failed to fetch surveys", err))
      .finally(() => setLoading(false));
    withRetry(() => getDoc(doc(db, "config", "settings")))
      .then((snap) => { if (snap.exists()) setSettings(snap.data()); })
      .catch(() => { /* keep defaults */ });
  }, []);

  const handlePrint = () => window.print();

  const urgencyRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...requests].sort((a, b) => {
    const byBureau = bureauName(a.bureau).localeCompare(bureauName(b.bureau), "th");
    if (byBureau !== 0) return byBureau;
    return (urgencyRank[a.urgency] ?? 3) - (urgencyRank[b.urgency] ?? 3);
  });

  const totalPoints = requests.reduce((acc, r) => acc + num(r.proposedCount), 0);

  const sumBy = (keyFn: (r: any) => string) => {
    const m: Record<string, { count: number; points: number }> = {};
    requests.forEach((r) => {
      const k = keyFn(r);
      m[k] = m[k] || { count: 0, points: 0 };
      m[k].count++;
      m[k].points += num(r.proposedCount);
    });
    return m;
  };
  const byBureau = sumBy((r) => bureauName(r.bureau));
  const byUrgency = sumBy((r) => urgencyText(r.urgency));
  const byType = sumBy((r) => labelFrom(SPEAKER_TYPES, r.speakerType));

  const orgName = settings.orgName || "เทศบาลนครนครสวรรค์";
  const title = settings.surveyTitle || "ความต้องการจุดติดตั้งระบบเสียงตามสาย (PA)";
  const today = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  const fiscalYear = new Date().getFullYear() + 543;
  const period = settings.openDate && settings.closeDate
    ? `${thaiDate(settings.openDate)} ถึง ${thaiDate(settings.closeDate)}`
    : "-";
  const docNo = `กยศ. ${new Date().getFullYear() + 543}/${String(requests.length).padStart(3, "0")}`;

  return (
    <div className="min-h-screen bg-slate-200 font-sarabun text-black print:bg-white">
      {/* แถบควบคุม (ไม่พิมพ์) */}
      <div className="print:hidden p-4 bg-white border-b flex justify-between items-center shadow-sm sticky top-0 z-50">
        <Button asChild variant="outline">
          <Link to="/admin/dashboard"><ArrowLeft className="w-4 h-4 mr-2" /> กลับ Dashboard</Link>
        </Button>
        <div className="text-sm text-slate-500 font-sans">แนะนำ: ตั้งค่าหน้ากระดาษ A4 แนวตั้ง • ปิด Header/Footer ของเบราว์เซอร์ • เปิด "กราฟิกพื้นหลัง"</div>
        <Button onClick={handlePrint} className="bg-primary text-white">
          <Printer className="w-4 h-4 mr-2" /> พิมพ์ / บันทึก PDF
        </Button>
      </div>

      {/* หน้า A4 */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white px-[20mm] py-[15mm] shadow-2xl print:shadow-none print:p-[12mm] my-8 print:my-0 text-[15px] leading-relaxed relative">
        {/* ตราและหัวหน่วยงาน */}
        <div className="text-center border-b-2 border-slate-800 pb-3 mb-5">
          <div className="mx-auto mb-2 w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center text-[10px] leading-tight text-slate-700 font-bold">
            ตรา<br />หน่วยงาน
          </div>
          <div className="text-[20px] font-bold">{orgName}</div>
          <div className="text-[13px] text-slate-600">กองยุทธศาสตร์และงบประมาณ · กลุ่มงานสถิติข้อมูลและสารสนเทศ</div>
        </div>

        {/* ชื่อรายงาน */}
        <div className="text-center mb-5">
          <h1 className="text-[19px] font-bold">รายงานสรุปผลการสำรวจ{title}</h1>
          <h2 className="text-[16px] font-bold">ประจำปีงบประมาณ พ.ศ. {fiscalYear}</h2>
        </div>

        {/* ข้อมูลเอกสาร */}
        <table className="w-full text-[13px] mb-5">
          <tbody>
            <tr>
              <td className="py-0.5 w-32 text-slate-600">เลขที่เอกสาร</td>
              <td className="py-0.5 font-medium">{docNo}</td>
              <td className="py-0.5 w-28 text-slate-600 text-right">วันที่จัดทำ</td>
              <td className="py-0.5 font-medium text-right w-44">{today}</td>
            </tr>
            <tr>
              <td className="py-0.5 text-slate-600">ช่วงเก็บข้อมูล</td>
              <td className="py-0.5 font-medium" colSpan={3}>{period}</td>
            </tr>
          </tbody>
        </table>

        {loading ? (
          <div className="text-center py-10">กำลังโหลดข้อมูล...</div>
        ) : (
          <>
            {/* ย่อหน้านำ */}
            <p className="indent-10 mb-4 text-[15px]">
              ตามที่ {orgName} ได้ดำเนินการสำรวจความต้องการ{title}จากส่วนราชการในสังกัด
              เพื่อนำข้อมูลไปประกอบการพิจารณาจัดตั้งงบประมาณรายจ่ายประจำปีงบประมาณ พ.ศ. {fiscalYear} นั้น
              บัดนี้ การสำรวจได้รวบรวมข้อมูลแล้ว จำนวน <b>{requests.length}</b> รายการ
              จาก <b>{Object.keys(byBureau).length}</b> หน่วยงาน รวมจำนวนจุดที่ขอติดตั้งทั้งสิ้น <b>{totalPoints}</b> จุด
              รายละเอียดปรากฏตามตารางด้านล่าง
            </p>

            {/* ๑. สรุปตามหน่วยงาน */}
            <h3 className="font-bold text-[16px] mb-1 mt-4">๑. สรุปตามหน่วยงาน</h3>
            <table className="w-full border-collapse border border-slate-700 text-[13px] mb-5">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border border-slate-700 px-2 py-1.5 w-12 text-center">ลำดับ</th>
                  <th className="border border-slate-700 px-2 py-1.5 text-left">หน่วยงาน</th>
                  <th className="border border-slate-700 px-2 py-1.5 w-28 text-center">จำนวนคำขอ</th>
                  <th className="border border-slate-700 px-2 py-1.5 w-28 text-center">รวมจุด</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byBureau).sort((a, b) => b[1].points - a[1].points).map(([name, v], i) => (
                  <tr key={name} className={i % 2 ? "bg-slate-50" : ""}>
                    <td className="border border-slate-700 px-2 py-1.5 text-center">{i + 1}</td>
                    <td className="border border-slate-700 px-2 py-1.5">{name}</td>
                    <td className="border border-slate-700 px-2 py-1.5 text-center">{v.count}</td>
                    <td className="border border-slate-700 px-2 py-1.5 text-center">{v.points}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-slate-100">
                  <td className="border border-slate-700 px-2 py-1.5 text-right" colSpan={2}>รวมทั้งสิ้น</td>
                  <td className="border border-slate-700 px-2 py-1.5 text-center">{requests.length}</td>
                  <td className="border border-slate-700 px-2 py-1.5 text-center">{totalPoints}</td>
                </tr>
              </tfoot>
            </table>

            {/* ๒. + ๓. เคียงกัน */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <h3 className="font-bold text-[16px] mb-1">๒. จำแนกตามความเร่งด่วน</h3>
                <table className="w-full border-collapse border border-slate-700 text-[13px]">
                  <thead>
                    <tr className="bg-slate-200">
                      <th className="border border-slate-700 px-2 py-1.5 text-left">ระดับ</th>
                      <th className="border border-slate-700 px-2 py-1.5 text-center">คำขอ</th>
                      <th className="border border-slate-700 px-2 py-1.5 text-center">จุด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["สูง", "ปานกลาง", "ต่ำ"].filter((k) => byUrgency[k]).map((k) => (
                      <tr key={k}>
                        <td className="border border-slate-700 px-2 py-1.5">{k}</td>
                        <td className="border border-slate-700 px-2 py-1.5 text-center">{byUrgency[k].count}</td>
                        <td className="border border-slate-700 px-2 py-1.5 text-center">{byUrgency[k].points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="font-bold text-[16px] mb-1">๓. จำแนกตามประเภทอุปกรณ์</h3>
                <table className="w-full border-collapse border border-slate-700 text-[13px]">
                  <thead>
                    <tr className="bg-slate-200">
                      <th className="border border-slate-700 px-2 py-1.5 text-left">ประเภท</th>
                      <th className="border border-slate-700 px-2 py-1.5 text-center">คำขอ</th>
                      <th className="border border-slate-700 px-2 py-1.5 text-center">จุด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(byType).map(([k, v]) => (
                      <tr key={k}>
                        <td className="border border-slate-700 px-2 py-1.5">{k}</td>
                        <td className="border border-slate-700 px-2 py-1.5 text-center">{v.count}</td>
                        <td className="border border-slate-700 px-2 py-1.5 text-center">{v.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ๔. รายละเอียดรายคำขอ */}
            <h3 className="font-bold text-[16px] mb-1">๔. รายละเอียดรายคำขอ</h3>
            <table className="w-full border-collapse border border-slate-700 text-[12px] mb-8">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border border-slate-700 px-1 py-1.5 w-8 text-center">ที่</th>
                  <th className="border border-slate-700 px-1 py-1.5 text-left">หน่วยงาน</th>
                  <th className="border border-slate-700 px-1 py-1.5 text-left">สถานที่ติดตั้ง</th>
                  <th className="border border-slate-700 px-1 py-1.5 text-left">ประเภท</th>
                  <th className="border border-slate-700 px-1 py-1.5 w-12 text-center">จุด</th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14 text-center">เร่งด่วน</th>
                  <th className="border border-slate-700 px-1 py-1.5 text-left">ผู้ประสานงาน / เวลา</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((req, i) => (
                  <tr key={req.id} className={i % 2 ? "bg-slate-50" : ""}>
                    <td className="border border-slate-700 px-1 py-1.5 text-center">{i + 1}</td>
                    <td className="border border-slate-700 px-1 py-1.5">{getDeptName(req.bureau, req.division)}</td>
                    <td className="border border-slate-700 px-1 py-1.5">{req.building} {req.floor && `ชั้น ${req.floor}`} {req.room}</td>
                    <td className="border border-slate-700 px-1 py-1.5">{labelFrom(SPEAKER_TYPES, req.speakerType)}</td>
                    <td className="border border-slate-700 px-1 py-1.5 text-center">{req.proposedCount}</td>
                    <td className="border border-slate-700 px-1 py-1.5 text-center">{urgencyText(req.urgency)}</td>
                    <td className="border border-slate-700 px-1 py-1.5">
                      {req.surveyor || req.contactPerson || "-"}{req.phone ? ` (${req.phone})` : ""}
                      {formatThaiTime(req) && <span className="block text-[10px] text-slate-500">{req.date} {formatThaiTime(req)}</span>}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan={7} className="border border-slate-700 px-2 py-4 text-center">ไม่มีข้อมูลการสำรวจ</td></tr>
                )}
              </tbody>
              {requests.length > 0 && (
                <tfoot>
                  <tr className="font-bold bg-slate-100">
                    <td colSpan={4} className="border border-slate-700 px-2 py-1.5 text-right">รวมจำนวนจุดติดตั้งทั้งสิ้น</td>
                    <td className="border border-slate-700 px-2 py-1.5 text-center">{totalPoints}</td>
                    <td className="border border-slate-700 px-2 py-1.5" colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>

            {/* ลายเซ็น */}
            <div className="grid grid-cols-2 gap-10 mt-14 text-center text-[14px] break-inside-avoid">
              <div>
                <div className="mb-14">ลงชื่อ ................................................ ผู้จัดทำ</div>
                <div>(................................................)</div>
                <div className="text-slate-600">เจ้าหน้าที่ผู้รับผิดชอบ</div>
                <div className="text-slate-600">วันที่ ......... / ......... / .........</div>
              </div>
              <div>
                <div className="mb-14">ลงชื่อ ................................................ ผู้ตรวจ</div>
                <div>(................................................)</div>
                <div className="text-slate-600">ผู้อำนวยการกองยุทธศาสตร์และงบประมาณ</div>
                <div className="text-slate-600">วันที่ ......... / ......... / .........</div>
              </div>
            </div>

            {/* ท้ายกระดาษ */}
            <div className="mt-10 pt-2 border-t border-slate-300 text-[10px] text-slate-400 flex justify-between print:fixed print:bottom-[8mm] print:left-[12mm] print:right-[12mm]">
              <span>{orgName} — เอกสารนี้จัดทำโดยระบบ Smart Survey</span>
              <span>พิมพ์เมื่อ {today}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfficialReport;
