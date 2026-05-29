import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ORG_STRUCTURE, SPEAKER_TYPES } from "@/survey/types";
import { collection, getDocs } from "firebase/firestore";
import { db, withRetry } from "@/lib/firebase";

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

const OfficialReport = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withRetry(() => getDocs(collection(db, "surveys")))
      .then((snapshot) => setRequests(snapshot.docs.map((d) => d.data())))
      .catch((err) => console.error("Failed to fetch surveys", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => window.print();

  // เรียงตามหน่วยงาน แล้วตามความเร่งด่วน (สูง > ปานกลาง > ต่ำ)
  const urgencyRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...requests].sort((a, b) => {
    const byBureau = bureauName(a.bureau).localeCompare(bureauName(b.bureau), "th");
    if (byBureau !== 0) return byBureau;
    return (urgencyRank[a.urgency] ?? 3) - (urgencyRank[b.urgency] ?? 3);
  });

  const totalPoints = requests.reduce((acc, r) => acc + num(r.proposedCount), 0);

  // ---- สรุปแยกตามมิติ ----
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

  const today = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-slate-100 font-sarabun text-black print:bg-white">
      {/* แถบควบคุม (ไม่พิมพ์) */}
      <div className="print:hidden p-4 bg-white border-b flex justify-between items-center shadow-sm sticky top-0 z-50">
        <Button asChild variant="outline">
          <Link to="/admin/dashboard"><ArrowLeft className="w-4 h-4 mr-2" /> กลับ Dashboard</Link>
        </Button>
        <div className="text-sm text-slate-500 font-sans">แนะนำ: ปิด Header/Footer และตั้งค่าหน้ากระดาษ A4 แนวตั้ง</div>
        <Button onClick={handlePrint} className="bg-primary text-white">
          <Printer className="w-4 h-4 mr-2" /> พิมพ์รายงาน
        </Button>
      </div>

      {/* หน้า A4 */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-[15mm] shadow-lg print:shadow-none print:p-0 my-8 print:my-0 text-[14pt] leading-tight relative">
        {/* หัวรายงาน */}
        <div className="text-center font-bold mb-4">
          <h1 className="text-[20pt] mb-1">รายงานสรุปความต้องการจุดติดตั้งระบบเสียงตามสาย (PA)</h1>
          <h2 className="text-[16pt] font-bold">ประจำปีงบประมาณ พ.ศ. {new Date().getFullYear() + 543}</h2>
          <div className="text-right font-normal text-[13pt] text-slate-600 mt-2">ข้อมูล ณ วันที่: {today}</div>
        </div>

        {loading ? (
          <div className="text-center py-10">กำลังโหลดข้อมูล...</div>
        ) : (
          <>
            {/* กล่องสรุปภาพรวม */}
            <div className="bg-slate-100 border border-slate-300 p-3 mb-5 grid grid-cols-3 gap-2 font-bold rounded-sm text-[14pt] text-center">
              <div>หน่วยงานที่ร้องขอ<br />{Object.keys(byBureau).length} หน่วยงาน</div>
              <div>จำนวนคำขอรวม<br />{requests.length} รายการ</div>
              <div>จำนวนจุดติดตั้งรวม<br />{totalPoints} จุด</div>
            </div>

            {/* ตารางที่ 1: สรุปตามหน่วยงาน */}
            <h3 className="font-bold text-[15pt] mb-1">๑. สรุปตามหน่วยงาน</h3>
            <table className="w-full border-collapse border border-black text-[13pt] mb-5">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black px-2 py-1 w-12 text-center">ลำดับ</th>
                  <th className="border border-black px-2 py-1 text-center">หน่วยงาน</th>
                  <th className="border border-black px-2 py-1 w-28 text-center">จำนวนคำขอ</th>
                  <th className="border border-black px-2 py-1 w-28 text-center">รวมจุด</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byBureau)
                  .sort((a, b) => b[1].points - a[1].points)
                  .map(([name, v], i) => (
                    <tr key={name}>
                      <td className="border border-black px-2 py-1 text-center">{i + 1}</td>
                      <td className="border border-black px-2 py-1">{name}</td>
                      <td className="border border-black px-2 py-1 text-center">{v.count}</td>
                      <td className="border border-black px-2 py-1 text-center">{v.points}</td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-slate-50">
                  <td className="border border-black px-2 py-1 text-right" colSpan={2}>รวมทั้งสิ้น</td>
                  <td className="border border-black px-2 py-1 text-center">{requests.length}</td>
                  <td className="border border-black px-2 py-1 text-center">{totalPoints}</td>
                </tr>
              </tfoot>
            </table>

            {/* ตารางที่ 2: สรุปตามความเร่งด่วน + ประเภท (เคียงกัน) */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <h3 className="font-bold text-[15pt] mb-1">๒. ตามความเร่งด่วน</h3>
                <table className="w-full border-collapse border border-black text-[13pt]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black px-2 py-1 text-center">ระดับ</th>
                      <th className="border border-black px-2 py-1 text-center">คำขอ</th>
                      <th className="border border-black px-2 py-1 text-center">จุด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["สูง", "ปานกลาง", "ต่ำ"].filter((k) => byUrgency[k]).map((k) => (
                      <tr key={k}>
                        <td className="border border-black px-2 py-1">{k}</td>
                        <td className="border border-black px-2 py-1 text-center">{byUrgency[k].count}</td>
                        <td className="border border-black px-2 py-1 text-center">{byUrgency[k].points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="font-bold text-[15pt] mb-1">๓. ตามประเภทอุปกรณ์</h3>
                <table className="w-full border-collapse border border-black text-[13pt]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black px-2 py-1 text-center">ประเภท</th>
                      <th className="border border-black px-2 py-1 text-center">คำขอ</th>
                      <th className="border border-black px-2 py-1 text-center">จุด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(byType).map(([k, v]) => (
                      <tr key={k}>
                        <td className="border border-black px-2 py-1">{k}</td>
                        <td className="border border-black px-2 py-1 text-center">{v.count}</td>
                        <td className="border border-black px-2 py-1 text-center">{v.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ตารางที่ 4: รายละเอียดรายคำขอ */}
            <h3 className="font-bold text-[15pt] mb-1">๔. รายละเอียดรายคำขอ</h3>
            <table className="w-full border-collapse border border-black text-[12pt] mb-6">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black px-1 py-1 w-8 text-center">ที่</th>
                  <th className="border border-black px-1 py-1 text-center">หน่วยงาน</th>
                  <th className="border border-black px-1 py-1 text-center">สถานที่ติดตั้ง</th>
                  <th className="border border-black px-1 py-1 text-center">ประเภท</th>
                  <th className="border border-black px-1 py-1 w-14 text-center">จุด</th>
                  <th className="border border-black px-1 py-1 w-16 text-center">เร่งด่วน</th>
                  <th className="border border-black px-1 py-1 text-center">ผู้ประสานงาน</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((req, i) => (
                  <tr key={req.id}>
                    <td className="border border-black px-1 py-1 text-center">{i + 1}</td>
                    <td className="border border-black px-1 py-1">{getDeptName(req.bureau, req.division)}</td>
                    <td className="border border-black px-1 py-1">{req.building} {req.floor && `ชั้น ${req.floor}`} {req.room}</td>
                    <td className="border border-black px-1 py-1">{labelFrom(SPEAKER_TYPES, req.speakerType)}</td>
                    <td className="border border-black px-1 py-1 text-center">{req.proposedCount}</td>
                    <td className="border border-black px-1 py-1 text-center">{urgencyText(req.urgency)}</td>
                    <td className="border border-black px-1 py-1">{req.surveyor || req.contactPerson || "-"}{req.phone ? ` (${req.phone})` : ""}</td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan={7} className="border border-black px-2 py-4 text-center">ไม่มีข้อมูลการสำรวจ</td></tr>
                )}
              </tbody>
              {requests.length > 0 && (
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan={4} className="border border-black px-2 py-1 text-right">รวมจำนวนจุดติดตั้งทั้งสิ้น</td>
                    <td className="border border-black px-2 py-1 text-center">{totalPoints}</td>
                    <td className="border border-black px-2 py-1" colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>

            {/* ช่องลงนาม */}
            <div className="grid grid-cols-2 gap-8 mt-12 text-center text-[13pt] break-inside-avoid">
              <div>
                <div className="mb-12">ลงชื่อ ................................................</div>
                <div>(................................................)</div>
                <div>ผู้จัดทำรายงาน</div>
              </div>
              <div>
                <div className="mb-12">ลงชื่อ ................................................</div>
                <div>(................................................)</div>
                <div>ผู้ตรวจสอบ / ผู้อำนวยการกอง</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfficialReport;
