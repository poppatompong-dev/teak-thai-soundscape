import { useSurvey } from "./SurveyContext";
import { Field, SectionCard, RadioCardGroup } from "./FormBits";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AREA_TYPES, PROBLEM_OPTIONS, SPEAKER_TYPES } from "./types";
import { Upload, ImageIcon } from "lucide-react";

type StepProps = { errors: Record<string, string> };

export const Step1Metadata = ({ errors }: StepProps) => {
  const { data, update } = useSurvey();
  return (
    <SectionCard title="ข้อมูลการสำรวจ" description="รายละเอียดผู้สำรวจและสถานที่ที่ทำการสำรวจ">
      <Field label="วันที่สำรวจ" required error={errors.surveyDate}>
        <Input type="date" value={data.surveyDate} onChange={(e) => update({ surveyDate: e.target.value })} />
      </Field>
      <Field label="ชื่อผู้สำรวจ" required error={errors.surveyor}>
        <Input value={data.surveyor} onChange={(e) => update({ surveyor: e.target.value })} placeholder="เช่น นายสมชาย ใจดี" />
      </Field>
      <Field label="ทีม/คณะทำงาน" error={errors.team}>
        <Input value={data.team} onChange={(e) => update({ team: e.target.value })} />
      </Field>
      <Field label="หน่วยงาน/กอง" required error={errors.department}>
        <Input value={data.department} onChange={(e) => update({ department: e.target.value })} placeholder="เช่น งานบริการประชาชน" />
      </Field>
      <Field label="อาคาร" required error={errors.building}>
        <Input value={data.building} onChange={(e) => update({ building: e.target.value })} placeholder="สำนักงานเทศบาล" />
      </Field>
      <Field label="ชั้น" required error={errors.floor}>
        <Input value={data.floor} onChange={(e) => update({ floor: e.target.value })} placeholder="ชั้น 1" />
      </Field>
      <Field label="ห้อง/บริเวณ" required error={errors.room}>
        <Input value={data.room} onChange={(e) => update({ room: e.target.value })} placeholder="เช่น ห้องประชุม" />
      </Field>
      <Field label="ผู้ประสานงานในพื้นที่" error={errors.contactPerson}>
        <Input value={data.contactPerson} onChange={(e) => update({ contactPerson: e.target.value })} />
      </Field>
      <Field label="เบอร์โทรติดต่อ" required error={errors.phone}>
        <Input value={data.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="081-234-5678" />
      </Field>
    </SectionCard>
  );
};

export const Step2Area = ({ errors }: StepProps) => {
  const { data, update } = useSurvey();
  return (
    <SectionCard title="ข้อมูลพื้นที่" description="ลักษณะพื้นที่ที่ต้องการติดตั้งระบบเสียงตามสาย">
      <div className="md:col-span-2">
        <Field label="ประเภทพื้นที่" required error={errors.areaType}>
          <RadioCardGroup
            value={data.areaType}
            onChange={(v) => update({ areaType: v })}
            options={AREA_TYPES}
            columns={3}
          />
          {data.areaType === "other" && (
            <Input
              className="mt-2"
              placeholder="ระบุประเภทพื้นที่อื่น ๆ"
              value={data.areaTypeOther}
              onChange={(e) => update({ areaTypeOther: e.target.value })}
            />
          )}
        </Field>
      </div>
      <Field label="ขนาดพื้นที่ (ตร.ม.)" required error={errors.roomSize}>
        <Input type="number" min={0} value={data.roomSize} onChange={(e) => update({ roomSize: e.target.value })} />
      </Field>
      <Field label="จำนวนเจ้าหน้าที่/ผู้มาใช้บริการ (โดยประมาณ)" required error={errors.occupants}>
        <Input type="number" min={0} value={data.occupants} onChange={(e) => update({ occupants: e.target.value })} />
      </Field>
      <Field label="ระดับเสียงรบกวนทั่วไป" required error={errors.noiseLevel}>
        <Select value={data.noiseLevel} onValueChange={(v) => update({ noiseLevel: v })}>
          <SelectTrigger><SelectValue placeholder="เลือกระดับเสียง" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">น้อย (เงียบสงบ)</SelectItem>
            <SelectItem value="medium">ปานกลาง</SelectItem>
            <SelectItem value="high">มาก (จอแจ)</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="ความสำคัญของการประกาศ" required error={errors.announcementImportance}>
        <Select value={data.announcementImportance} onValueChange={(v) => update({ announcementImportance: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">ต่ำ</SelectItem>
            <SelectItem value="medium">ปานกลาง</SelectItem>
            <SelectItem value="high">สูง</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="เวลาทำการ" error={errors.operatingHours}>
        <Input value={data.operatingHours} onChange={(e) => update({ operatingHours: e.target.value })} placeholder="08:30 - 16:30 น." />
      </Field>
    </SectionCard>
  );
};

export const Step3Current = ({ errors }: StepProps) => {
  const { data, update } = useSurvey();
  const toggleProblem = (val: string) => {
    const cur = data.problems.includes(val) ? data.problems.filter((p) => p !== val) : [...data.problems, val];
    update({ problems: cur });
  };
  return (
    <SectionCard title="สภาพระบบเสียงเดิม" description="ข้อมูลจุดและสภาพอุปกรณ์ที่มีอยู่ในปัจจุบัน">
      <Field label="มีจุดติดตั้งลำโพงเดิมหรือไม่" required error={errors.hasExistingSpeaker}>
        <RadioCardGroup
          value={data.hasExistingSpeaker}
          onChange={(v) => update({ hasExistingSpeaker: v })}
          options={[
            { value: "yes", label: "มี" },
            { value: "no", label: "ไม่มี" },
          ]}
        />
      </Field>
      <Field label="สภาพอุปกรณ์เดิม" error={errors.existingCondition}>
        <Select value={data.existingCondition} onValueChange={(v) => update({ existingCondition: v })}>
          <SelectTrigger><SelectValue placeholder="เลือกสภาพ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="good">ใช้งานได้ดี</SelectItem>
            <SelectItem value="fair">พอใช้</SelectItem>
            <SelectItem value="poor">ชำรุด/ต้องซ่อม</SelectItem>
            <SelectItem value="none">ไม่มีอุปกรณ์เดิม</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="md:col-span-2">
        <Field label="ปัญหาที่พบในปัจจุบัน (เลือกได้หลายข้อ)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROBLEM_OPTIONS.map((p) => {
              const checked = data.problems.includes(p.value);
              return (
                <label key={p.value} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${checked ? "border-secondary bg-accent" : "border-border bg-card hover:bg-accent/40"}`}>
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
        <Field label="แนบรูปถ่ายพื้นที่ (ตัวอย่าง UI)">
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 cursor-pointer hover:border-secondary hover:bg-accent/30 transition">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              {data.photoName ? <ImageIcon className="w-6 h-6 text-secondary" /> : <Upload className="w-6 h-6 text-secondary" />}
            </div>
            <span className="text-sm font-medium text-foreground">
              {data.photoName || "กดเพื่ออัปโหลดรูปภาพ (PNG, JPG)"}
            </span>
            <span className="text-xs text-muted-foreground">ขนาดไม่เกิน 5MB · ตัวอย่างสำหรับต้นแบบ</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => update({ photoName: e.target.files?.[0]?.name ?? "" })} />
          </label>
        </Field>
      </div>
    </SectionCard>
  );
};

export const Step4Proposed = ({ errors }: StepProps) => {
  const { data, update } = useSurvey();
  return (
    <SectionCard title="จุดที่เสนอติดตั้ง" description="รายละเอียดจุดที่เสนอติดตั้งลำโพงและความเหมาะสมเบื้องต้น">
      <div className="md:col-span-2">
        <Field label="ตำแหน่งที่เสนอติดตั้ง" required error={errors.proposedPosition}>
          <Textarea rows={3} value={data.proposedPosition} onChange={(e) => update({ proposedPosition: e.target.value })} placeholder="อธิบายตำแหน่งติดตั้ง เช่น กลางฝ้าเพดาน มุมห้องด้านทิศ..." />
        </Field>
      </div>
      <Field label="จำนวนจุดลำโพง" required error={errors.proposedCount}>
        <Input type="number" min={1} value={data.proposedCount} onChange={(e) => update({ proposedCount: e.target.value })} />
      </Field>
      <Field label="ความเป็นไปได้ของการเดินสาย" required error={errors.cableFeasibility}>
        <Select value={data.cableFeasibility} onValueChange={(v) => update({ cableFeasibility: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="feasible">เดินสายได้สะดวก</SelectItem>
            <SelectItem value="conditional">เดินสายได้ มีเงื่อนไข</SelectItem>
            <SelectItem value="difficult">เดินสายยาก/ต้องปรับปรุง</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="md:col-span-2">
        <Field label="ประเภทลำโพง" required error={errors.speakerType}>
          <RadioCardGroup value={data.speakerType} onChange={(v) => update({ speakerType: v })} options={SPEAKER_TYPES} columns={3} />
          {data.speakerType === "other" && (
            <Input className="mt-2" placeholder="ระบุประเภทอื่น ๆ" value={data.speakerTypeOther} onChange={(e) => update({ speakerTypeOther: e.target.value })} />
          )}
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="จุดไฟฟ้า/ควบคุม/เครือข่ายที่ใกล้ที่สุด" error={errors.nearestPower}>
          <Textarea rows={2} value={data.nearestPower} onChange={(e) => update({ nearestPower: e.target.value })} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="ข้อจำกัด/อุปสรรค" error={errors.constraints}>
          <Textarea rows={2} value={data.constraints} onChange={(e) => update({ constraints: e.target.value })} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="เหตุผลความจำเป็น" required error={errors.reasonForNeed}>
          <Textarea rows={3} value={data.reasonForNeed} onChange={(e) => update({ reasonForNeed: e.target.value })} />
        </Field>
      </div>
    </SectionCard>
  );
};

const CHECK_OPTS = [
  { value: "pass", label: "ผ่าน" },
  { value: "improve", label: "ปรับปรุงก่อน" },
  { value: "fail", label: "ไม่ผ่าน" },
];

export const Step5Technical = ({ errors }: StepProps) => {
  const { data, update } = useSurvey();
  const items: { key: keyof typeof data; label: string }[] = [
    { key: "cableSafety", label: "ความปลอดภัยในการเดินสาย" },
    { key: "ceilingReadiness", label: "ความพร้อมของฝ้า/ผนัง" },
    { key: "powerAvailable", label: "แหล่งจ่ายไฟพร้อมใช้งาน" },
    { key: "controlAvailable", label: "จุดควบคุม/เครือข่ายพร้อม" },
    { key: "maintenanceAccess", label: "เข้าซ่อมบำรุงได้สะดวก" },
  ];
  return (
    <SectionCard title="รายการตรวจสอบทางเทคนิค" description="ผลตรวจสอบเบื้องต้นโดยเจ้าหน้าที่เทคนิค">
      {items.map((it) => (
        <div key={it.key} className="md:col-span-2">
          <Field label={it.label} required>
            <RadioCardGroup
              value={data[it.key] as string}
              onChange={(v) => update({ [it.key]: v } as never)}
              options={CHECK_OPTS}
              columns={3}
            />
          </Field>
        </div>
      ))}
      <Field label="ผลกระทบต่อผู้ใช้งานในสำนักงาน" required error={errors.userImpact}>
        <Select value={data.userImpact} onValueChange={(v) => update({ userImpact: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">น้อย</SelectItem>
            <SelectItem value="medium">ปานกลาง</SelectItem>
            <SelectItem value="high">มาก</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="ผลสรุปความเหมาะสม" required error={errors.suitability}>
        <Select value={data.suitability} onValueChange={(v) => update({ suitability: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="suitable">เหมาะสม ติดตั้งได้</SelectItem>
            <SelectItem value="improve">ต้องปรับปรุงก่อนติดตั้ง</SelectItem>
            <SelectItem value="unsuitable">ไม่เหมาะสม</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="md:col-span-2">
        <Field label="หมายเหตุความเสี่ยง">
          <Textarea rows={3} value={data.riskNotes} onChange={(e) => update({ riskNotes: e.target.value })} />
        </Field>
      </div>
    </SectionCard>
  );
};

export const Step6Approval = ({ errors }: StepProps) => {
  const { data, update } = useSurvey();
  return (
    <>
      <SectionCard title="อนุมัติและลำดับความสำคัญ" description="ระดับความเร่งด่วนและบันทึกความเห็นเจ้าหน้าที่">
        <div className="md:col-span-2">
          <Field label="ระดับความเร่งด่วน" required error={errors.urgency}>
            <RadioCardGroup
              value={data.urgency}
              onChange={(v) => update({ urgency: v })}
              options={[
                { value: "high", label: "สูง", description: "ต้องดำเนินการโดยเร็ว" },
                { value: "medium", label: "ปานกลาง", description: "ดำเนินการตามแผน" },
                { value: "low", label: "ต่ำ", description: "ดำเนินการเมื่อพร้อม" },
              ]}
              columns={3}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="ผู้ได้รับประโยชน์โดยประมาณ" required error={errors.beneficiaries}>
            <Input value={data.beneficiaries} onChange={(e) => update({ beneficiaries: e.target.value })} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="บันทึกของเจ้าหน้าที่">
            <Textarea rows={3} value={data.officerNotes} onChange={(e) => update({ officerNotes: e.target.value })} />
          </Field>
        </div>
      </SectionCard>
      <SectionCard title="ลายมือชื่อผู้เกี่ยวข้อง" description="กรอกชื่อผู้รับผิดชอบในแต่ละบทบาท">
        <Field label="ผู้สำรวจ" required error={errors.signSurveyor}>
          <Input value={data.signSurveyor} onChange={(e) => update({ signSurveyor: e.target.value })} />
        </Field>
        <Field label="เจ้าหน้าที่เทคนิค">
          <Input value={data.signTechnical} onChange={(e) => update({ signTechnical: e.target.value })} placeholder="ชื่อ-สกุล" />
        </Field>
        <Field label="ตัวแทนหน่วยงาน">
          <Input value={data.signDept} onChange={(e) => update({ signDept: e.target.value })} placeholder="ชื่อ-สกุล" />
        </Field>
        <Field label="ผู้อนุมัติ">
          <Input value={data.signApprover} onChange={(e) => update({ signApprover: e.target.value })} placeholder="ชื่อ-สกุล" />
        </Field>
      </SectionCard>
    </>
  );
};

export const SubmitButton = ({ onClick }: { onClick: () => void }) => (
  <Button onClick={onClick} size="lg" className="bg-primary hover:bg-primary-glow text-primary-foreground">
    ตรวจสอบข้อมูลก่อนส่ง
  </Button>
);
