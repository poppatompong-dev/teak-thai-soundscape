import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSurvey } from "@/survey/SurveyContext";
import { AREA_TYPES, PROBLEM_OPTIONS, SPEAKER_TYPES, ORG_STRUCTURE } from "@/survey/types";
import { ArrowLeft, Send, Speaker, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const labelFrom = (list: { value: string; label: string }[], v: string) => list.find((x) => x.value === v)?.label ?? v;

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-2.5 border-b border-border last:border-0">
    <div className="text-sm text-muted-foreground sm:w-56 flex-shrink-0">{label}</div>
    <div className="text-sm text-foreground font-medium">{value || <span className="text-muted-foreground italic">— ไม่ระบุ —</span>}</div>
  </div>
);

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="gov-card p-5 md:p-6">
    <h2 className="text-base md:text-lg text-primary mb-3 flex items-center gap-2">
      <span className="w-1.5 h-5 bg-secondary rounded-full" /> {title}
    </h2>
    <div>{children}</div>
  </div>
);

const dict = {
  yesno: { yes: "มี", no: "ไม่มี" },
  cond: { good: "ใช้งานได้ดี", fair: "พอใช้", poor: "ชำรุด/ต้องซ่อม", none: "ไม่มีอุปกรณ์เดิม" },
  noise: { low: "น้อย", medium: "ปานกลาง", high: "มาก" },
  importance: { low: "ต่ำ", medium: "ปานกลาง", high: "สูง" },
  feasibility: { feasible: "เดินสายได้สะดวก", conditional: "เดินสายได้ มีเงื่อนไข", difficult: "เดินสายยาก" },
  check: { pass: "ผ่าน", improve: "ปรับปรุงก่อน", fail: "ไม่ผ่าน" },
  impact: { low: "น้อย", medium: "ปานกลาง", high: "มาก" },
  suit: { suitable: "เหมาะสม ติดตั้งได้", improve: "ต้องปรับปรุงก่อนติดตั้ง", unsuitable: "ไม่เหมาะสม" },
  urgency: { high: "สูง", medium: "ปานกลาง", low: "ต่ำ" },
} as Record<string, Record<string, string>>;

const Review = () => {
  const { data, setRefNumber } = useSurvey();
  const navigate = useNavigate();

  const submit = () => {
    const ref = "PA-" + new Date().getFullYear() + "-" + Math.floor(100000 + Math.random() * 900000);
    setRefNumber(ref);
    toast({ title: "ส่งแบบสำรวจสำเร็จ", description: `เลขอ้างอิง ${ref}` });
    navigate("/confirmation");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Speaker className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="text-xs opacity-80">ขั้นตอนสุดท้าย</div>
              <div className="text-sm md:text-base font-semibold">ตรวจสอบข้อมูลก่อนส่ง</div>
            </div>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-sm bg-white/10 backdrop-blur px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-4 h-4" /> ข้อมูลพร้อมส่ง
          </div>
        </div>
        <div className="container mx-auto px-4 pb-8">
          <h1 className="text-2xl md:text-3xl font-semibold">สรุปข้อมูลแบบสำรวจ</h1>
          <p className="text-sm text-white/80 mt-1">โปรดตรวจสอบความถูกต้องก่อนกดส่งแบบสำรวจ</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-5xl space-y-5">
        {(() => {
          const b = ORG_STRUCTURE.find((x) => x.value === data.bureau);
          const d = b?.divisions.find((x) => x.value === data.division);
          const s = d?.sections.find((x) => x.value === data.section);
          return (
            <Block title="หน่วยงาน">
              <Row label="สำนัก" value={b?.label} />
              <Row label="กอง" value={d?.label} />
              <Row label="ส่วน" value={s?.label} />
            </Block>
          );
        })()}

        <Block title="ข้อมูลการสำรวจ">
          <Row label="วันที่สำรวจ" value={data.surveyDate} />
          <Row label="ผู้สำรวจ / ทีม" value={`${data.surveyor}${data.team ? " · " + data.team : ""}`} />
          <Row label="หน่วยงาน" value={data.department} />
          <Row label="อาคาร / ชั้น / ห้อง" value={`${data.building} · ${data.floor} · ${data.room}`} />
          <Row label="ผู้ประสานงาน" value={`${data.contactPerson} · ${data.phone}`} />
        </Block>

        <Block title="ข้อมูลพื้นที่">
          <Row label="ประเภทพื้นที่" value={`${labelFrom(AREA_TYPES, data.areaType)}${data.areaType === "other" ? ` (${data.areaTypeOther})` : ""}`} />
          <Row label="ขนาดพื้นที่" value={`${data.roomSize} ตร.ม.`} />
          <Row label="จำนวนผู้ใช้งาน" value={`${data.occupants} คน`} />
          <Row label="ระดับเสียงรบกวน" value={dict.noise[data.noiseLevel]} />
          <Row label="ความสำคัญของการประกาศ" value={dict.importance[data.announcementImportance]} />
          <Row label="เวลาทำการ" value={data.operatingHours} />
        </Block>

        <Block title="สภาพระบบเสียงเดิม">
          <Row label="มีจุดติดตั้งเดิม" value={dict.yesno[data.hasExistingSpeaker]} />
          <Row label="สภาพอุปกรณ์เดิม" value={dict.cond[data.existingCondition]} />
          <Row
            label="ปัญหาที่พบ"
            value={
              data.problems.length
                ? data.problems.map((p) => labelFrom(PROBLEM_OPTIONS, p)).join(", ") + (data.problems.includes("other") && data.problemsOther ? ` (${data.problemsOther})` : "")
                : ""
            }
          />
          <Row label="รูปภาพแนบ" value={data.photoName || "—"} />
        </Block>

        <Block title="จุดที่เสนอติดตั้ง">
          <Row label="ตำแหน่งที่เสนอ" value={data.proposedPosition} />
          <Row label="จำนวนจุด" value={`${data.proposedCount} จุด`} />
          <Row label="ประเภทลำโพง" value={`${labelFrom(SPEAKER_TYPES, data.speakerType)}${data.speakerType === "other" ? ` (${data.speakerTypeOther})` : ""}`} />
          <Row label="ความเป็นไปได้ของการเดินสาย" value={dict.feasibility[data.cableFeasibility]} />
          <Row label="จุดไฟฟ้า/ควบคุมใกล้สุด" value={data.nearestPower} />
          <Row label="ข้อจำกัด" value={data.constraints} />
          <Row label="เหตุผลความจำเป็น" value={data.reasonForNeed} />
        </Block>

        <Block title="ตรวจสอบทางเทคนิค">
          <Row label="ความปลอดภัยการเดินสาย" value={dict.check[data.cableSafety]} />
          <Row label="ความพร้อมฝ้า/ผนัง" value={dict.check[data.ceilingReadiness]} />
          <Row label="แหล่งจ่ายไฟ" value={dict.check[data.powerAvailable]} />
          <Row label="จุดควบคุม/เครือข่าย" value={dict.check[data.controlAvailable]} />
          <Row label="การเข้าซ่อมบำรุง" value={dict.check[data.maintenanceAccess]} />
          <Row label="ผลกระทบต่อผู้ใช้งาน" value={dict.impact[data.userImpact]} />
          <Row label="ผลสรุปความเหมาะสม" value={dict.suit[data.suitability]} />
          <Row label="หมายเหตุความเสี่ยง" value={data.riskNotes} />
        </Block>

        <Block title="อนุมัติ / ลำดับความสำคัญ">
          <Row label="ความเร่งด่วน" value={dict.urgency[data.urgency]} />
          <Row label="ผู้ได้รับประโยชน์" value={data.beneficiaries} />
          <Row label="บันทึกของเจ้าหน้าที่" value={data.officerNotes} />
          <Row label="ผู้สำรวจ" value={data.signSurveyor} />
          <Row label="เจ้าหน้าที่เทคนิค" value={data.signTechnical} />
          <Row label="ตัวแทนหน่วยงาน" value={data.signDept} />
          <Row label="ผู้อนุมัติ" value={data.signApprover} />
        </Block>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
          <Button variant="outline" size="lg" onClick={() => navigate("/survey")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> กลับไปแก้ไข
          </Button>
          <Button size="lg" onClick={submit} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-elevated">
            <Send className="w-4 h-4 mr-1" /> ส่งแบบสำรวจ
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Review;
