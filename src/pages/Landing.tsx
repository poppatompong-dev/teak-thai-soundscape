import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Speaker, ArrowRight, ClipboardEdit, HardHat, FileText, PhoneCall, CalendarClock, ShieldAlert } from "lucide-react";

const workflowSteps = [
  { icon: ClipboardEdit, title: "1. แจ้งความต้องการ", desc: "ส่วนราชการกรอกแบบฟอร์มเพื่อระบุสถานที่และจำนวนจุดที่ต้องการติดตั้งหรือปรับปรุง" },
  { icon: HardHat, title: "2. สำรวจและประเมิน", desc: "เจ้าหน้าที่ลงพื้นที่สำรวจความเหมาะสมและจัดทำประมาณการราคา" },
  { icon: FileText, title: "3. เสนอของบประมาณ", desc: "รวบรวมข้อมูลทั้งหมดเพื่อนำไปบรรจุในร่างงบประมาณรายจ่ายประจำปี" },
];

const formatDateThai = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const thMonth = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${d.getDate()} ${thMonth[d.getMonth()]} ${d.getFullYear() + 543}`;
};

const checkIsWithinPeriod = (openStr?: string, closeStr?: string) => {
  if (!openStr || !closeStr) return true;
  const now = new Date();
  const openDate = new Date(openStr);
  openDate.setHours(0, 0, 0, 0);
  const closeDate = new Date(closeStr);
  closeDate.setHours(23, 59, 59, 999);
  return now >= openDate && now <= closeDate;
};

const Landing = () => {
  const [settings, setSettings] = useState({ 
    isOpen: true, 
    openDate: "2026-05-01", 
    closeDate: "2026-07-30",
    orgName: "เทศบาลนครนครสวรรค์",
    surveyTitle: "ร่วมสำรวจความต้องการจุดติดตั้งระบบเสียงตามสาย (PA)",
    surveyDescription: "เพื่อให้การแจ้งข่าวสารในอาคารเทศบาลเป็นไปอย่างทั่วถึงและมีประสิทธิภาพ ขอเชิญทุกหน่วยงานร่วมแจ้งความต้องการจุดติดตั้งหรือปรับปรุงระบบเสียงเดิมของคุณ เพื่อนำไปประกอบการจัดตั้งงบประมาณอย่างเป็นรูปธรรม\\n\\n* หมายเหตุ: PA ย่อมาจาก Public Address คือระบบขยายเสียงกระจายข่าวสารสาธารณะที่ครอบคลุมพื้นที่กว้าง",
    contactInfo: "ติดต่อ: กองยุทธศาสตร์และงบประมาณ (กลุ่มงานสถิติข้อมูลและสารสนเทศ)\\nโทร. 4212 (ในวันและเวลาราชการ)"
  });

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && data.isOpen !== undefined) setSettings(data);
      })
      .catch(console.error);
  }, []);

  const isWithinPeriod = checkIsWithinPeriod(settings.openDate, settings.closeDate);
  const canSubmit = settings.isOpen && isWithinPeriod;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Speaker className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="text-xs opacity-80">{settings.orgName || "เทศบาล"} · โครงการยกระดับการสื่อสาร</div>
              <div className="text-sm md:text-base font-semibold">Soundscape Survey</div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-8 pb-16 md:pt-16 md:pb-24">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-block text-xs font-medium tracking-wide bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                📣 เปิดรับฟังความคิดเห็นจากทุกส่วนราชการ
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 whitespace-pre-line">
              {settings.surveyTitle || "ร่วมสำรวจความต้องการจุดติดตั้งระบบเสียงตามสาย (PA)"}
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-6 max-w-2xl leading-relaxed whitespace-pre-line">
              {settings.surveyDescription || "เพื่อให้การแจ้งข่าวสารในอาคารเทศบาลเป็นไปอย่างทั่วถึงและมีประสิทธิภาพ ขอเชิญทุกหน่วยงานร่วมแจ้งความต้องการจุดติดตั้งหรือปรับปรุงระบบเสียงเดิมของคุณ เพื่อนำไปประกอบการจัดตั้งงบประมาณอย่างเป็นรูปธรรม"}
            </p>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-8 inline-flex items-center gap-3 backdrop-blur-md">
              {canSubmit ? (
                <>
                  <CalendarClock className="w-8 h-8 text-secondary" />
                  <div>
                    <div className="text-xs text-white/70">กำหนดเปิดรับข้อมูล</div>
                    <div className="text-sm font-semibold text-white">{formatDateThai(settings.openDate)} - {formatDateThai(settings.closeDate)}</div>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-8 h-8 text-red-400" />
                  <div>
                    <div className="text-xs text-white/70">สถานะระบบ</div>
                    <div className="text-sm font-semibold text-red-100">{!settings.isOpen ? "ปิดรับข้อมูลแบบสำรวจแล้ว (ปิดระบบ)" : "อยู่นอกช่วงเวลาการรับแบบสำรวจ"}</div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {canSubmit ? (
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-elevated">
                  <Link to="/survey">
                    ทำแบบสำรวจทันที (ใช้เวลา 1 นาที)
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              ) : (
                <Button disabled size="lg" className="bg-white/50 text-primary-foreground shadow-elevated">
                  หมดเขตการทำแบบสำรวจ
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>



      {/* Workflow */}
      <section className="container mx-auto px-4 py-14 md:py-20 relative z-10 -mt-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl text-primary mb-3 font-bold">ขั้นตอนการดำเนินงาน</h2>
          <p className="text-muted-foreground">กระบวนการตั้งแต่เริ่มแจ้งความต้องการจนถึงการตั้งงบประมาณ</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-border -translate-y-1/2 z-0"></div>
          
          {workflowSteps.map((step, i) => (
            <div key={step.title} className="gov-card p-6 relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground mb-5 shadow-elevated border-4 border-background">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg text-primary mb-2 font-bold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="gov-card mt-12 p-6 md:p-10 bg-gradient-card flex flex-col md:flex-row md:items-center justify-between gap-5 border border-primary/10 shadow-sm">
          <div>
            <h3 className="text-xl text-primary mb-2 font-bold">ร่วมยกระดับการให้บริการของเทศบาลไปพร้อมกัน</h3>
            <p className="text-sm text-muted-foreground">แบบฟอร์มนี้เปิดให้เจ้าหน้าที่ทุกส่วนราชการแจ้งความประสงค์ได้ผ่านมือถือและคอมพิวเตอร์</p>
          </div>
          <Button asChild size="lg" className={canSubmit ? "bg-primary hover:bg-primary-glow text-primary-foreground shadow-elevated whitespace-nowrap" : "bg-muted text-muted-foreground whitespace-nowrap pointer-events-none"}>
            <Link to={canSubmit ? "/survey" : "#"}>{canSubmit ? "เริ่มแจ้งความต้องการ" : "ปิดรับข้อมูลแล้ว"} {canSubmit && <ArrowRight className="w-4 h-4 ml-2" />}</Link>
          </Button>
        </div>
      </section>

      {/* Contact */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-2xl mx-auto text-center border-t border-border pt-10">
          <div className="w-12 h-12 bg-accent text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">พบปัญหาการใช้งาน หรือมีข้อสอบถามเพิ่มเติม</h3>
          <p className="text-sm text-slate-600 whitespace-pre-line">
            {settings.contactInfo || "ติดต่อ: กองยุทธศาสตร์และงบประมาณ (กลุ่มงานสถิติข้อมูลและสารสนเทศ)\\nโทร. 4212 (ในวันและเวลาราชการ)"}
          </p>
        </div>
      </section>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} {settings.orgName || "สำนักงานเทศบาล"} · แพลตฟอร์มรับฟังความเห็นเพื่อจัดทำงบประมาณ</div>
          <Link to="/login" className="hover:text-primary transition-colors">
            สำหรับผู้ดูแลระบบ
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
