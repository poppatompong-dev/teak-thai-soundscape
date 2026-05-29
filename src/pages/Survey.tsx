import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Speaker, RefreshCcw } from "lucide-react";
import { StepIndicator, STEPS } from "@/survey/StepIndicator";
import {
  Step1Location,
  Step2Requirement,
  Step3Budgeting,
} from "@/survey/Steps";
import { useSurvey } from "@/survey/SurveyContext";
import { validateStep } from "@/survey/validation";
import { toast } from "@/hooks/use-toast";
import { OrgSelect } from "@/survey/OrgSelect";
import { doc, getDoc } from "firebase/firestore";
import { db, withRetry } from "@/lib/firebase";

const checkIsWithinPeriod = (openStr?: string, closeStr?: string) => {
  if (!openStr || !closeStr) return true;
  const now = new Date();
  const openDate = new Date(openStr);
  openDate.setHours(0, 0, 0, 0);
  const closeDate = new Date(closeStr);
  closeDate.setHours(23, 59, 59, 999);
  return now >= openDate && now <= closeDate;
};

const Survey = () => {
  const [step, setStep] = useState(0);
  const [orgConfirmed, setOrgConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data, reset } = useSurvey();
  const navigate = useNavigate();
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  const [settings, setSettings] = useState({ isOpen: true, openDate: "", closeDate: "", loaded: false, surveyTitle: "แบบสำรวจความต้องการ" });

  useEffect(() => {
    withRetry(() => getDoc(doc(db, "config", "settings")))
      .then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data) {
            setSettings({ 
              isOpen: data.isOpen ?? true, 
              openDate: data.openDate || "", 
              closeDate: data.closeDate || "", 
              surveyTitle: data.surveyTitle || "แบบสำรวจความต้องการ",
              loaded: true 
            });
          }
        } else {
          setSettings(prev => ({ ...prev, loaded: true }));
        }
      })
      .catch(() => setSettings({ isOpen: true, openDate: "", closeDate: "", loaded: true, surveyTitle: "แบบสำรวจความต้องการ" }));
  }, []);

  if (settings.loaded) {
    const isWithinPeriod = checkIsWithinPeriod(settings.openDate, settings.closeDate);
    const canSubmit = settings.isOpen && isWithinPeriod;
    if (!canSubmit) {
      return <Navigate to="/" replace />;
    }
  }

  if (!orgConfirmed || !data.bureau) {
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
      case 0: return <Step1Location errors={errors} />;
      case 1: return <Step2Requirement errors={errors} />;
      case 2: return <Step3Budgeting errors={errors} />;
      default: return null;
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
              <div className="text-xs opacity-80">แพลตฟอร์ม</div>
              <div className="text-sm md:text-base font-semibold">{settings.surveyTitle}</div>
            </div>
          </Link>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => {
              if (confirm("คุณต้องการล้างข้อมูลที่กรอกไว้ทั้งหมดและเริ่มใหม่หรือไม่?")) {
                reset();
                setStep(0);
                setOrgConfirmed(false);
              }
            }} className="bg-white/10 border-white/30 text-white hover:bg-red-500/80 hover:border-red-400 hover:text-white transition-colors">
              <RefreshCcw className="w-4 h-4 mr-1" /> ล้างข้อมูล/เริ่มใหม่
            </Button>
          )}
        </div>
        <div className="container mx-auto px-4 pb-8 pt-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-white/60 mb-2 font-medium">
            <span>ขั้นตอน {step + 1}/{STEPS.length}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold mb-1">{STEPS[step]}</h1>
          <p className="text-sm text-white/75">กรอกข้อมูลให้ครบถ้วน ระบบจะตรวจสอบก่อนไปขั้นตอนถัดไป</p>
        </div>
      </header>

      <div className="container mx-auto px-4 -mt-3 relative z-10">
        <div className="gov-card p-4 md:p-6">
          <StepIndicator current={step} />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto space-y-5">
          <div key={step} className="step-content space-y-5">
            {renderStep()}
          </div>

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
