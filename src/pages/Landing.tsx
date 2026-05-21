import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Speaker, ClipboardList, MapPin, ShieldCheck, ArrowRight, Building2, Users, Activity } from "lucide-react";

const stats = [
  { icon: Building2, label: "อาคารที่สำรวจ", value: "12", hint: "อาคารสำนักงาน" },
  { icon: MapPin, label: "จุดเสนอติดตั้ง", value: "84", hint: "จุดทั่วอาคาร" },
  { icon: Users, label: "ผู้รับประโยชน์", value: "3,200", hint: "ราย/เดือน" },
  { icon: Activity, label: "ดำเนินการแล้ว", value: "67%", hint: "ของแผนทั้งหมด" },
];

const features = [
  { icon: ClipboardList, title: "แบบสำรวจครบถ้วน", desc: "เก็บข้อมูลพื้นที่ สภาพระบบเดิม และข้อเสนอแนะการติดตั้ง" },
  { icon: ShieldCheck, title: "ตรวจสอบทางเทคนิค", desc: "รายการตรวจสอบมาตรฐานพร้อมประเมินความเหมาะสม" },
  { icon: Speaker, title: "แผนติดตั้งชัดเจน", desc: "ระบุประเภทลำโพง จำนวนจุด และความเป็นไปได้ในการเดินสาย" },
];

const Landing = () => {
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
              <div className="text-xs opacity-80">เทศบาล · ระบบสำรวจ</div>
              <div className="text-sm md:text-base font-semibold">PA Survey System</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur">เวอร์ชันต้นแบบ v1.0</span>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-8 pb-16 md:pt-16 md:pb-24">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-medium tracking-wide bg-white/15 backdrop-blur px-3 py-1.5 rounded-full mb-5">
              สำหรับเจ้าหน้าที่ภาคสนาม
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              แบบสำรวจจุดติดตั้งเสียงตามสาย
              <br />
              <span className="text-white/90">ภายในอาคารสำนักงานเทศบาล</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-8 max-w-2xl">
              ระบบเก็บข้อมูลภาคสนามสำหรับวางแผนติดตั้งระบบเสียงประกาศภายในอาคาร
              ครอบคลุมตั้งแต่ข้อมูลพื้นที่ สภาพระบบเดิม จนถึงข้อเสนอติดตั้งและการอนุมัติ
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-elevated">
                <Link to="/survey">
                  เริ่มทำแบบสำรวจ
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white">
                <a href="#features">ดูรายละเอียดระบบ</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard cards */}
      <section className="container mx-auto px-4 -mt-10 md:-mt-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="gov-card p-4 md:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-secondary">
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-14 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl text-primary mb-3">ขั้นตอนการสำรวจที่ครบถ้วน</h2>
          <p className="text-muted-foreground">ออกแบบสำหรับเจ้าหน้าที่ภาคสนาม ใช้งานได้ทั้งบนมือถือและคอมพิวเตอร์</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="gov-card p-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg text-primary mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="gov-card mt-10 p-6 md:p-10 bg-gradient-card flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h3 className="text-xl text-primary mb-1">พร้อมเริ่มเก็บข้อมูลภาคสนามแล้วหรือยัง?</h3>
            <p className="text-sm text-muted-foreground">ใช้เวลาประมาณ 8-12 นาที ต่อ 1 จุดสำรวจ</p>
          </div>
          <Button asChild size="lg" className="bg-primary hover:bg-primary-glow text-primary-foreground">
            <Link to="/survey">เริ่มทำแบบสำรวจ <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-6 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} สำนักงานเทศบาล · ระบบสำรวจจุดติดตั้งเสียงตามสาย (ต้นแบบ)
        </div>
      </footer>
    </div>
  );
};

export default Landing;
