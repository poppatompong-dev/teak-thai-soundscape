import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSurvey } from "@/survey/SurveyContext";
import { PROBLEM_OPTIONS, SPEAKER_TYPES, ORG_STRUCTURE } from "@/survey/types";
import { ArrowLeft, Send, Speaker, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db, withRetry } from "@/lib/firebase";

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
  urgency: { high: "สูง", medium: "ปานกลาง", low: "ต่ำ" },
} as Record<string, Record<string, string>>;

const Review = () => {
  const { data, setRefNumber } = useSurvey();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);

    // Reuse a ref number across retries so a slow/duplicated save can't create
    // two records for the same submission.
    const ref = "PA-" + new Date().getFullYear() + "-" + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const payload = {
      id: ref,
      date: now.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
      // ISO timestamp of submission — used for precise time display & sorting.
      createdAt: now.toISOString(),
      status: "pending",
      ...data,
    };

    // Keep a copy locally until we confirm the server accepted it, so an
    // intermittent connection can't silently lose the submission.
    try {
      localStorage.setItem("pending-submission", JSON.stringify(payload));
    } catch {
      /* ignore */
    }

    try {
      // Retry automatically — the connection to Firestore can be flaky.
      await withRetry(() => setDoc(doc(db, "surveys", ref), payload));

      try {
        localStorage.removeItem("pending-submission");
      } catch {
        /* ignore */
      }
      setRefNumber(ref);
      toast({ title: "ส่งแบบสำรวจสำเร็จ", description: `เลขอ้างอิง ${ref}` });
      navigate("/confirmation");
    } catch (err) {
      toast({
        title: "ส่งข้อมูลไม่สำเร็จ (เครือข่ายไม่เสถียร)",
        description: "ข้อมูลของท่านถูกเก็บไว้ในเครื่องแล้ว ไม่หาย — กรุณากด 'ส่งข้อมูลสรุป' อีกครั้งโดยไม่ต้องกรอกใหม่",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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
          <h1 className="text-2xl md:text-3xl font-semibold">สรุปข้อมูลเพื่อการตั้งงบประมาณ</h1>
          <p className="text-sm text-white/80 mt-1">โปรดตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนส่ง</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-5xl space-y-5">
        {(() => {
          const b = ORG_STRUCTURE.find((x) => x.value === data.bureau);
          const d = b?.divisions?.find((x) => x.value === data.division);
          const s = d?.sections?.find((x) => x.value === data.section);
          return (
            <Block title="หน่วยงาน">
              <Row label="หน่วยงานหลัก" value={b?.label} />
              <Row label="หน่วยงานย่อย" value={d?.label} />
              {s?.label && <Row label="ระดับปฏิบัติการ" value={s.label} />}
            </Block>
          );
        })()}

        <Block title="ข้อมูลสถานที่และผู้ติดต่อ">
          <Row label="ข้อมูล ณ วันที่" value={data.surveyDate} />
          <Row label="ผู้สำรวจ" value={data.surveyor} />
          <Row label="อาคาร / ชั้น / ห้อง" value={`${data.building} · ${data.floor} · ${data.room}`} />
          {data.phone && <Row label="เบอร์โทรติดต่อ" value={data.phone} />}
        </Block>

        <Block title="รายละเอียดความต้องการ">
          <Row
            label="สภาพปัญหาเดิม"
            value={
              data.problems.length
                ? data.problems.map((p) => labelFrom(PROBLEM_OPTIONS, p)).join(", ") + (data.problems.includes("other") && data.problemsOther ? ` (${data.problemsOther})` : "")
                : ""
            }
          />
          <Row label="หมวดหมู่/ประเภทที่ต้องการ" value={`${labelFrom(SPEAKER_TYPES, data.speakerType)}${data.speakerType === "other" ? ` (${data.speakerTypeOther})` : ""}`} />
          <Row label="จำนวน" value={`${data.proposedCount} หน่วย`} />
          <Row label="สถานที่/ตำแหน่งติดตั้ง" value={data.proposedPosition} />
          <Row label="รูปภาพสถานที่" value={data.photoName || "ไม่ได้แนบรูปภาพ"} />
        </Block>

        <Block title="ข้อมูลเพื่อการตั้งงบประมาณ">
          <Row label="เหตุผลความจำเป็น" value={data.reasonForNeed} />
          <Row label="ความเร่งด่วน" value={dict.urgency[data.urgency]} />
          <Row label="จำนวนผู้ได้รับประโยชน์" value={data.beneficiaries} />
          <Row label="ข้อคิดเห็นเพิ่มเติม" value={data.comments} />
          <Row label="ความพึงพอใจต่อระบบ" value={`${data.satisfaction} / 5`} />
        </Block>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
          <Button variant="outline" size="lg" onClick={() => navigate("/survey")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> กลับไปแก้ไข
          </Button>
          <Button size="lg" onClick={submit} disabled={submitting} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-elevated">
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> กำลังส่ง...</>
            ) : (
              <><Send className="w-4 h-4 mr-1" /> ส่งข้อมูลสรุป</>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Review;
