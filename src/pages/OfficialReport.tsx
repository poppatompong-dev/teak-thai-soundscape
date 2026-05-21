import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ORG_STRUCTURE, SPEAKER_TYPES } from "@/survey/types";

const labelFrom = (list: { value: string; label: string }[], v: string) => list.find((x) => x.value === v)?.label ?? v;

const getDeptName = (bureau: string, div: string) => {
  const b = ORG_STRUCTURE.find(x => x.value === bureau);
  const d = b?.divisions?.find(x => x.value === div);
  if (d) return `${b?.label} (${d.label})`;
  return b?.label || bureau;
};

const OfficialReport = () => {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/surveys`)
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error("Failed to fetch surveys", err));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const totalPoints = requests.reduce((acc, r) => acc + (parseInt(r.proposedCount) || 0), 0);
  const totalBudgetEstimate = totalPoints * 2500; // Mock budget 2500 THB per point

  return (
    <div className="min-h-screen bg-slate-100 font-sarabun text-black print:bg-white">
      {/* Non-printable controls */}
      <div className="print:hidden p-4 bg-white border-b flex justify-between items-center shadow-sm sticky top-0 z-50">
        <Button asChild variant="outline">
          <Link to="/admin/dashboard"><ArrowLeft className="w-4 h-4 mr-2" /> กลับ Dashboard</Link>
        </Button>
        <div className="text-sm text-slate-500 font-sans">
          แนะนำ: ปิด Header/Footer และตั้งค่าหน้ากระดาษเป็น A4 แนวตั้ง ในการพิมพ์
        </div>
        <Button onClick={handlePrint} className="bg-primary text-white">
          <Printer className="w-4 h-4 mr-2" /> พิมพ์รายงาน
        </Button>
      </div>

      {/* Printable A4 Page */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-[15mm] shadow-lg print:shadow-none print:p-0 my-8 print:my-0 text-[14pt] leading-tight relative">
        
        {/* Header */}
        <div className="text-center font-bold mb-4">
          <h1 className="text-[20pt] mb-2">รายงานสรุปความต้องการจุดติดตั้งระบบเสียงตามสาย (PA) ประจำปีงบประมาณ</h1>
          <div className="text-right font-normal text-[14pt] text-slate-600">
            ข้อมูล ณ วันที่: {new Date().toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-100 border border-slate-300 p-3 mb-6 flex justify-between font-bold rounded-sm text-[15pt]">
          <div>จำนวนหน่วยงานที่ร้องขอ: {requests.length} หน่วยงาน</div>
          <div>จำนวนจุดติดตั้งรวม: {totalPoints} จุด</div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-black text-[14pt] mb-6">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black px-2 py-1 font-bold text-center w-12">ลำดับ</th>
              <th className="border border-black px-2 py-1 font-bold text-center">หน่วยงานผู้ร้องขอ</th>
              <th className="border border-black px-2 py-1 font-bold text-center">สถานที่ตั้ง</th>
              <th className="border border-black px-2 py-1 font-bold text-center w-24">จำนวน (จุด)</th>
              <th className="border border-black px-2 py-1 font-bold text-center w-28">ความเร่งด่วน</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, i) => (
              <tr key={req.id}>
                <td className="border border-black px-2 py-1 text-center">{i + 1}</td>
                <td className="border border-black px-2 py-1">{getDeptName(req.bureau, req.division)}</td>
                <td className="border border-black px-2 py-1">{req.building} {req.floor && `ชั้น ${req.floor}`} {req.room}</td>
                <td className="border border-black px-2 py-1 text-center">{req.proposedCount}</td>
                <td className="border border-black px-2 py-1 text-center">
                  {req.urgency === 'high' ? 'สูง' : req.urgency === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="border border-black px-2 py-4 text-center">ไม่มีข้อมูลการสำรวจ</td>
              </tr>
            )}
          </tbody>
          {requests.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={3} className="border border-black px-2 py-1 text-right font-bold">รวมจำนวนจุดติดตั้งทั้งสิ้น</td>
                <td className="border border-black px-2 py-1 text-center font-bold">{totalPoints}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
            </tfoot>
          )}
        </table>

      </div>
    </div>
  );
};

export default OfficialReport;
