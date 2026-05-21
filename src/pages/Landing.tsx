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
    surveyTitle: "แบบสำรวจความต้องการ (ทั่วไป)",
    surveyDescription: "ขอเชิญทุกหน่วยงานร่วมแจ้งความต้องการ เพื่อนำไปประกอบการจัดตั้งงบประมาณอย่างเป็นรูปธรรม",
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
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-sm">
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm text-sm font-medium mb-8 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              เปิดรับข้อมูล: {new Date(settings.openDate).toLocaleDateString('th-TH', {day: 'numeric', month: 'short'})} - {new Date(settings.closeDate).toLocaleDateString('th-TH', {day: 'numeric', month: 'short', year: 'numeric'})}
            </div>
            
            <div className="text-emerald-300 font-medium tracking-wide text-sm md:text-base uppercase mb-3">
              ระบบสารสนเทศเพื่อการตั้งงบประมาณ
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-balance">
              {settings.surveyTitle || "แบบสำรวจความต้องการ (ทั่วไป)"}
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed text-pretty">
              {settings.surveyDescription || "ขอเชิญทุกหน่วยงานร่วมแจ้งความต้องการ เพื่อนำไปประกอบการจัดตั้งงบประมาณอย่างเป็นรูปธรรม"}
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 inline-flex items-center gap-4 backdrop-blur-lg shadow-sm">
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
                  <Link to="/survey" className="flex items-center">
                    ทำแบบสำรวจทันที (ใช้เวลา 1 นาที)
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
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
            <div key={step.title} className="gov-card p-8 relative z-10 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] hover:border-primary/20 cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-primary-foreground mb-6 shadow-elevated border-[3px] border-background">
                <step.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg text-primary mb-3 font-bold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="gov-card mt-12 p-6 md:p-10 bg-gradient-card flex flex-col md:flex-row md:items-center justify-between gap-5 border border-primary/10 shadow-sm">
          <div>
            <h3 className="text-xl text-primary mb-2 font-bold">ร่วมยกระดับการให้บริการของเทศบาลไปพร้อมกัน</h3>
            <p className="text-sm text-muted-foreground">แบบฟอร์มนี้เปิดให้เจ้าหน้าที่ทุกส่วนราชการแจ้งความประสงค์ได้ผ่านมือถือและคอมพิวเตอร์</p>
          </div>
          <Button asChild size="lg" className={canSubmit ? "bg-primary hover:bg-primary-glow text-primary-foreground shadow-elevated whitespace-nowrap group" : "bg-muted text-muted-foreground whitespace-nowrap pointer-events-none"}>
            <Link to={canSubmit ? "/survey" : "#"}>{canSubmit ? "เริ่มแจ้งความต้องการ" : "ปิดรับข้อมูลแล้ว"} {canSubmit && <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />}</Link>
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
