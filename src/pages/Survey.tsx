import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Speaker, Save } from "lucide-react";
import { StepIndicator, STEPS } from "@/survey/StepIndicator";
import {
  Step1Metadata,
  Step2Area,
  Step3Current,
  Step4Proposed,
  Step5Technical,
  Step6Approval,
} from "@/survey/Steps";
import { useSurvey } from "@/survey/SurveyContext";
import { validateStep } from "@/survey/validation";
import { toast } from "@/hooks/use-toast";
import { OrgSelect } from "@/survey/OrgSelect";

const Survey = () => {
  const [step, setStep] = useState(0);
  const [orgConfirmed, setOrgConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data } = useSurvey();
  const navigate = useNavigate();

  if (!orgConfirmed || !data.bureau || !data.division || !data.section) {
    return <OrgSelect onContinue={() => setOrgConfirmed(true)} />;
  }

  const next = () => {
    const e = validateStep(step, data);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast({ title: "ข้อมูลไม่ครบถ้วน", description: "กรุณาตรวจสอบช่องที่จำเป็นต้องกรอก", variant: "destructive" });
      return;
    }
    if (step === STEPS.length - 1) {
      navigate("/review");
    } else {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const back = () => {
    if (step === 0) return;
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <Step1Metadata errors={errors} />;
      case 1: return <Step2Area errors={errors} />;
      case 2: return <Step3Current errors={errors} />;
      case 3: return <Step4Proposed errors={errors} />;
      case 4: return <Step5Technical errors={errors} />;
      case 5: return <Step6Approval errors={errors} />;
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
              <div className="text-xs opacity-80">แบบสำรวจ</div>
              <div className="text-sm md:text-base font-semibold">จุดติดตั้งเสียงตามสาย</div>
            </div>
          </Link>
          <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
            <Save className="w-4 h-4 mr-1" /> บันทึกร่าง
          </Button>
        </div>
        <div className="container mx-auto px-4 pb-6">
          <h1 className="text-xl md:text-2xl font-semibold mb-1">ขั้นตอนที่ {step + 1} จาก {STEPS.length} · {STEPS[step]}</h1>
          <p className="text-sm text-white/80">กรอกข้อมูลให้ครบถ้วน ระบบจะตรวจสอบก่อนไปขั้นตอนถัดไป</p>
        </div>
      </header>

      <div className="container mx-auto px-4 -mt-3 relative z-10">
        <div className="gov-card p-4 md:p-5">
          <StepIndicator current={step} />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-5 max-w-5xl mx-auto">
          {renderStep()}

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
            <Button variant="outline" onClick={back} disabled={step === 0} size="lg">
              <ArrowLeft className="w-4 h-4 mr-1" /> ย้อนกลับ
            </Button>
            <Button onClick={next} size="lg" className="bg-primary hover:bg-primary-glow text-primary-foreground">
              {step === STEPS.length - 1 ? "ตรวจสอบก่อนส่ง" : "ขั้นตอนถัดไป"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Survey;
