import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSurvey } from "@/survey/SurveyContext";
import { CheckCircle2, Download, Printer, Home, FileText, Speaker } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Confirmation = () => {
  const { refNumber, data, reset } = useSurvey();

  if (!refNumber) return <Navigate to="/" replace />;

  const fakeAction = (label: string) => () => toast({ title: label, description: "ฟังก์ชันต้นแบบ (UI เท่านั้น)" });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Speaker className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="text-xs opacity-80">ส่งแบบสำรวจสำเร็จ</div>
              <div className="text-sm md:text-base font-semibold">ระบบสำรวจจุดติดตั้งเสียง</div>
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

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={fakeAction("ดาวน์โหลด PDF")} variant="outline" size="lg">
              <Download className="w-4 h-4 mr-1" /> ดาวน์โหลด PDF
            </Button>
            <Button onClick={fakeAction("พิมพ์เอกสาร")} variant="outline" size="lg">
              <Printer className="w-4 h-4 mr-1" /> พิมพ์สรุป
            </Button>
            <Button onClick={fakeAction("ส่งทางอีเมล")} variant="outline" size="lg">
              <FileText className="w-4 h-4 mr-1" /> ส่งอีเมล
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          <Button asChild size="lg" className="bg-primary hover:bg-primary-glow text-primary-foreground">
            <Link to="/" onClick={() => reset()}>
              <Home className="w-4 h-4 mr-1" /> กลับสู่หน้าหลัก
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/survey" onClick={() => reset()}>
              สำรวจจุดถัดไป
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Confirmation;
