import { useSurvey } from "./SurveyContext";
import { Field, SectionCard, RadioCardGroup } from "./FormBits";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PROBLEM_OPTIONS, SPEAKER_TYPES } from "./types";
import { Upload, ImageIcon } from "lucide-react";

type StepProps = { errors: Record<string, string> };

export const Step1Location = ({ errors }: StepProps) => {
  const { data, update } = useSurvey();
  return (
    <SectionCard title="ข้อมูลสถานที่และผู้ติดต่อ" description="รายละเอียดสถานที่และผู้รับผิดชอบในพื้นที่">
      <Field label="ชื่อผู้สำรวจ" required error={errors.surveyor}>
        <Input value={data.surveyor} onChange={(e) => update({ surveyor: e.target.value })} placeholder="เช่น นายสมชาย ใจดี" />
      </Field>
      <Field label="อาคาร" required error={errors.building}>
        <Input value={data.building} onChange={(e) => update({ building: e.target.value })} placeholder="สำนักงานเทศบาล" />
      </Field>
      <Field label="ชั้น (ไม่บังคับ)" error={errors.floor}>
        <Input value={data.floor} onChange={(e) => update({ floor: e.target.value })} placeholder="ชั้น 1" />
      </Field>
      <div className="md:col-span-2">
        <Field label="ห้อง/บริเวณที่ต้องการติดตั้ง (ไม่บังคับ)" error={errors.room}>
          <Input value={data.room} onChange={(e) => update({ room: e.target.value })} placeholder="เช่น ห้องประชุมใหญ่ / โถงทางเดิน / ฝ่ายทะเบียนราษฎร" />
        </Field>
      </div>
      <Field label="ผู้ประสานงานในพื้นที่" required error={errors.contactPerson}>
        <Input value={data.contactPerson} onChange={(e) => update({ contactPerson: e.target.value })} placeholder="ชื่อ-สกุล" />
      </Field>
      <Field label="เบอร์โทรติดต่อ (ไม่บังคับ)" error={errors.phone}>
        <Input value={data.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="081-234-5678" />
      </Field>
    </SectionCard>
  );
};

export const Step2Requirement = ({ errors }: StepProps) => {
  const { data, update } = useSurvey();
  const toggleProblem = (val: string) => {
    const cur = data.problems.includes(val) ? data.problems.filter((p) => p !== val) : [...data.problems, val];
    update({ problems: cur });
  };
  return (
    <SectionCard title="รายละเอียดความต้องการ" description="รูปแบบและจำนวนที่เสนอขอ">
      <div className="md:col-span-2">
        <Field label="สภาพปัญหาเดิม (เลือกได้หลายข้อ)" error={errors.problems}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROBLEM_OPTIONS.map((p) => {
              const checked = data.problems.includes(p.value);
              return (
                <label key={p.value} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-200 ${checked ? "border-secondary bg-secondary/10 ring-1 ring-secondary/30 shadow-sm" : "border-border bg-card hover:border-secondary/60 hover:bg-secondary/5"}`}>
                  <Checkbox checked={checked} onCheckedChange={() => toggleProblem(p.value)} />
                  <span className="text-sm">{p.label}</span>
                </label>
              );
            })}
          </div>
          {data.problems.includes("other") && (
            <Input className="mt-2" placeholder="ระบุปัญหาอื่น ๆ" value={data.problemsOther} onChange={(e) => update({ problemsOther: e.target.value })} />
          )}
        </Field>
      </div>

      <div className="md:col-span-2">
        <Field label="หมวดหมู่/ประเภทที่ต้องการ" error={errors.speakerType}>
          <RadioCardGroup value={data.speakerType} onChange={(v) => update({ speakerType: v })} options={SPEAKER_TYPES} columns={2} />
          {data.speakerType === "other" && (
            <Input className="mt-2" placeholder="ระบุประเภทอื่น ๆ" value={data.speakerTypeOther} onChange={(e) => update({ speakerTypeOther: e.target.value })} />
          )}
        </Field>
      </div>

      <div className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="จำนวนที่เสนอขอ" required error={errors.proposedCount}>
            <div className="relative">
              <Input type="number" min={1} value={data.proposedCount} onChange={(e) => update({ proposedCount: e.target.value })} className="pr-16 text-lg font-medium" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">หน่วย/จุด</div>
            </div>
          </Field>
        </div>
      </div>

      <div className="md:col-span-2">
        <Field label="คำอธิบายเพิ่มเติม/สถานที่ติดตั้ง (ไม่บังคับ)" error={errors.proposedPosition}>
          <Textarea rows={3} value={data.proposedPosition} onChange={(e) => update({ proposedPosition: e.target.value })} placeholder="อธิบายรายละเอียดเพิ่มเติม เช่น ตำแหน่งติดตั้ง, วัตถุประสงค์เฉพาะ..." />
        </Field>
      </div>

      <div className="md:col-span-2">
        <Field label="แนบรูปถ่ายสถานที่ (ถ้ามี)">
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 cursor-pointer transition-all duration-200 hover:border-secondary/60 hover:bg-secondary/5">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              {data.photoName ? <ImageIcon className="w-6 h-6 text-secondary" /> : <Upload className="w-6 h-6 text-secondary" />}
            </div>
            <span className="text-sm font-medium text-foreground">
              {data.photoName || "กดเพื่ออัปโหลดรูปภาพสถานที่จริง (PNG, JPG)"}
            </span>
            <span className="text-xs text-muted-foreground">เพื่อประกอบการพิจารณาจุดติดตั้ง</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => update({ photoName: e.target.files?.[0]?.name ?? "" })} />
          </label>
        </Field>
      </div>
    </SectionCard>
  );
};

export const Step3Budgeting = ({ errors }: StepProps) => {
  const { data, update } = useSurvey();
  return (
    <SectionCard title="ข้อมูลเพื่อการตั้งงบประมาณ" description="รายละเอียดเพื่อนำไปประกอบการเขียนโครงการและพิจารณางบประมาณ">
      <div className="md:col-span-2">
        <Field label="เหตุผลความจำเป็นของโครงการ" error={errors.reasonForNeed}>
          <Textarea rows={4} value={data.reasonForNeed} onChange={(e) => update({ reasonForNeed: e.target.value })} placeholder="อธิบายความสำคัญและความจำเป็น..." />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="ระดับความเร่งด่วน" required error={errors.urgency}>
          <RadioCardGroup
            value={data.urgency}
            onChange={(v) => update({ urgency: v })}
            options={[
              { value: "high", label: "สูง", description: "ต้องดำเนินการทันที/จำเป็นมาก" },
              { value: "medium", label: "ปานกลาง", description: "ตั้งงบประมาณตามวงรอบปกติ" },
              { value: "low", label: "ต่ำ", description: "ดำเนินการเมื่อมีงบประมาณเหลือจ่าย" },
            ]}
            columns={3}
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="จำนวนผู้ได้รับประโยชน์โดยประมาณ (ไม่บังคับ)" error={errors.beneficiaries}>
          <Input value={data.beneficiaries} onChange={(e) => update({ beneficiaries: e.target.value })} placeholder="เช่น ประชาชนผู้มาติดต่อราชการประมาณ 150 คน/วัน" />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="ข้อคิดเห็นและข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)" error={errors.comments}>
          <Textarea rows={3} value={data.comments} onChange={(e) => update({ comments: e.target.value })} placeholder="หากมีข้อเสนอแนะอื่นๆ สามารถระบุได้ที่นี่..." />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="ระดับความพึงพอใจต่อระบบการสำรวจนี้" required error={errors.satisfaction}>
          <RadioCardGroup
            value={data.satisfaction}
            onChange={(v) => update({ satisfaction: v })}
            options={[
              { value: "5", label: "⭐⭐⭐⭐⭐ พึงพอใจมากที่สุด" },
              { value: "4", label: "⭐⭐⭐⭐ พึงพอใจมาก" },
              { value: "3", label: "⭐⭐⭐ พึงพอใจปานกลาง" },
              { value: "2", label: "⭐⭐ พึงพอใจน้อย" },
              { value: "1", label: "⭐ พึงพอใจน้อยที่สุด" },
            ]}
            columns={2}
          />
        </Field>
      </div>
    </SectionCard>
  );
};

export const SubmitButton = ({ onClick }: { onClick: () => void }) => (
  <Button onClick={onClick} size="lg" className="bg-primary hover:bg-primary-glow text-primary-foreground">
    ตรวจสอบข้อมูลก่อนส่ง
  </Button>
);
