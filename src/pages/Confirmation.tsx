import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSurvey } from "@/survey/SurveyContext";
import { CheckCircle2, Download, Printer, Home, FileText, Speaker, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { ORG_STRUCTURE, PROBLEM_OPTIONS, SPEAKER_TYPES } from "@/survey/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const labelFrom = (list: { value: string; label: string }[], v: string) => list.find((x) => x.value === v)?.label ?? v;

const Confirmation = () => {
  const { refNumber, data, reset } = useSurvey();
  const [bureauStats, setBureauStats] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/surveys`);
        const surveys = await res.json();
        
        const counts: Record<string, number> = {};
        surveys.forEach((s: any) => {
          if (s.bureau) {
            counts[s.bureau] = (counts[s.bureau] || 0) + 1;
          }
        });

        const stats = Object.keys(counts)
          .map(bureauVal => {
            const label = ORG_STRUCTURE.find(x => x.value === bureauVal)?.label || bureauVal;
            return { name: label, count: counts[bureauVal] };
          })
          .sort((a, b) => b.count - a.count);

        setBureauStats(stats);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    if (refNumber) fetchStats();
  }, [refNumber]);

  if (!refNumber) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-hero text-primary-foreground print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Speaker className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="text-xs opacity-80">ส่งแบบสำรวจสำเร็จ</div>
              <div className="text-sm md:text-base font-semibold">ระบบสำรวจความต้องการ</div>
            </div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
        <div className="gov-card p-6 md:p-10 text-center bg-gradient-card">
          <div className="w-16 h-16 rounded-full bg-secondary/15 text-secondary mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl text-primary mb-2">ส่งแบบสำรวจเรียบร้อยแล้ว</h1>
          <p className="text-muted-foreground mb-6">ระบบได้บันทึกข้อมูลของท่านและออกเลขอ้างอิงสำหรับติดตามผล</p>

          <div className="inline-block rounded-2xl border-2 border-dashed border-secondary/60 bg-accent/60 px-6 py-4 mb-6">
            <div className="text-xs text-muted-foreground mb-1">เลขที่อ้างอิง</div>
            <div className="text-2xl md:text-3xl font-bold text-primary tracking-wider">{refNumber}</div>
          </div>

          <div className="text-sm text-foreground/80 max-w-md mx-auto mb-6">
            สถานที่สำรวจ: <span className="font-medium">{data.building} · {data.floor} · {data.room}</span>
            <br />
            ส่งโดย: <span className="font-medium">{data.surveyor}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
            <Button onClick={() => window.print()} variant="outline" size="lg">
              <Printer className="w-4 h-4 mr-1" /> พิมพ์เอกสาร / บันทึก PDF
            </Button>
            <Button onClick={() => {
              const body = `เลขที่อ้างอิง: ${refNumber}\nสถานที่: ${data.building} ชั้น ${data.floor || "-"} ห้อง ${data.room || "-"}\nผู้สำรวจ: ${data.surveyor}`;
              window.location.href = `mailto:?subject=แจ้งความประสงค์ [${refNumber}]&body=${encodeURIComponent(body)}`;
            }} variant="outline" size="lg">
              <FileText className="w-4 h-4 mr-1" /> ส่งทางอีเมล
            </Button>
          </div>
        </div>

        {bureauStats.length > 0 && (
          <div className="gov-card p-5 md:p-6 mb-6 print:hidden">
            <h3 className="font-semibold text-primary flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-secondary" /> 
              สถิติการส่งแบบสำรวจ (แยกตามสำนัก/กอง)
            </h3>
            <div className="h-72 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bureauStats.slice(0, 8)} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-35} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="จำนวนรายการ" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {bureauStats.length > 8 && (
              <p className="text-xs text-muted-foreground mt-4 text-center">และหน่วยงานอื่นๆ รวมทั้งหมด {bureauStats.length} สำนัก/กอง</p>
            )}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 mt-6 print:hidden">
          <Button asChild size="lg" className="bg-primary hover:bg-primary-glow text-primary-foreground">
            <Link to="/" onClick={() => reset()}>
              <Home className="w-4 h-4 mr-1" /> กลับสู่หน้าหลัก
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/survey" onClick={() => reset()}>
              ทำแบบสำรวจอีกครั้ง
            </Link>
          </Button>
        </div>
      </main>

      {/* Print Only Template */}
      <div className="hidden print:block p-8 bg-white text-black text-sm">
        <div className="text-center mb-8 border-b border-black pb-4">
          <h1 className="text-2xl font-bold mb-2">แบบรายงานการสำรวจความต้องการ</h1>
          <p className="text-lg">รหัสอ้างอิง: {refNumber}</p>
        </div>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">1. ข้อมูลสถานที่และผู้ติดต่อ</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>ผู้สำรวจ:</strong> {data.surveyor}</div>
              <div><strong>ผู้ประสานงาน:</strong> {data.contactPerson}</div>
              <div><strong>เบอร์โทรติดต่อ:</strong> {data.phone || "-"}</div>
              <div><strong>อาคาร:</strong> {data.building}</div>
              <div><strong>ชั้น:</strong> {data.floor || "-"}</div>
              <div><strong>ห้อง/บริเวณ:</strong> {data.room || "-"}</div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">2. ความต้องการติดตั้ง</h2>
            <div className="space-y-2">
              <div><strong>จำนวนที่เสนอขอ:</strong> {data.proposedCount} หน่วย</div>
              <div><strong>สถานที่/ตำแหน่งติดตั้ง:</strong> {data.proposedPosition || "-"}</div>
              <div><strong>หมวดหมู่/ประเภทความต้องการ:</strong> {labelFrom(SPEAKER_TYPES, data.speakerType)} {data.speakerType === "other" && `(${data.speakerTypeOther})`}</div>
              <div>
                <strong>สภาพปัญหาเดิม:</strong> 
                {data.problems.length 
                  ? " " + data.problems.map((p) => labelFrom(PROBLEM_OPTIONS, p)).join(", ") + (data.problems.includes("other") && data.problemsOther ? ` (${data.problemsOther})` : "")
                  : " -"}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">3. ข้อมูลเพื่อการตั้งงบประมาณ</h2>
            <div className="space-y-2">
              <div><strong>ความเร่งด่วน:</strong> {data.urgency === "high" ? "สูง" : data.urgency === "medium" ? "ปานกลาง" : "ต่ำ"}</div>
              <div><strong>เหตุผลความจำเป็นของโครงการ:</strong> {data.reasonForNeed || "-"}</div>
              <div><strong>จำนวนผู้ได้รับประโยชน์โดยประมาณ:</strong> {data.beneficiaries || "-"}</div>
              <div><strong>ข้อคิดเห็นและข้อเสนอแนะเพิ่มเติม:</strong> {data.comments || "-"}</div>
            </div>
          </section>
        </div>

        <div className="mt-20 flex justify-end">
          <div className="text-center w-64">
            <div className="border-b border-black mb-2"></div>
            <div className="mb-1">(...................................................)</div>
            <div>ผู้รายงาน / ผู้สำรวจ</div>
            <div className="mt-2">วันที่ {new Date().toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
