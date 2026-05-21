import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Building2, Speaker } from "lucide-react";
import { useSurvey } from "./SurveyContext";
import { ORG_STRUCTURE } from "./types";
import { Field, SectionCard } from "./FormBits";

export const OrgSelect = ({ onContinue }: { onContinue: () => void }) => {
  const { data, update } = useSurvey();

  const divisions = useMemo(
    () => ORG_STRUCTURE.find((b) => b.value === data.bureau)?.divisions ?? [],
    [data.bureau],
  );
  const sections = useMemo(
    () => divisions.find((d) => d.value === data.division)?.sections ?? [],
    [divisions, data.division],
  );

  const canContinue = !!data.bureau;

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
        </div>
        <div className="container mx-auto px-4 pb-10 pt-2">
          <h1 className="text-xl md:text-2xl font-semibold mb-1">เลือกหน่วยงานก่อนเริ่มแบบสำรวจ</h1>
          <p className="text-sm text-white/80">โปรดระบุสำนัก กอง (ฝ่ายและส่วนสามารถข้ามได้หากไม่มี)</p>
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-6 py-6 md:py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          <SectionCard
            title="หน่วยงานผู้ดำเนินการสำรวจ"
            description="ข้อมูลนี้จะใช้กำกับแบบสำรวจและรายงานสรุป"
          >
            <div className="md:col-span-2">
              <Field label="หน่วยงานหลัก (สำนัก/กอง)" required>
                <Select
                  value={data.bureau}
                  onValueChange={(v) => update({ bureau: v, division: "", section: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหน่วยงานหลัก" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORG_STRUCTURE.map((b) => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="หน่วยงานย่อย (ส่วน/ฝ่าย) (เลือกได้ถ้ามี)">
                <Select
                  value={data.division}
                  onValueChange={(v) => update({ division: v === "none" ? "" : v, section: "" })}
                  disabled={!data.bureau}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={data.bureau ? "เลือกหน่วยงานย่อย (ข้ามได้)" : "กรุณาเลือกหน่วยงานหลักก่อน"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่มี / ไม่ระบุ</SelectItem>
                    {divisions.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="ระดับปฏิบัติการ (งาน/โรงเรียน) (เลือกได้ถ้ามี)">
                <Select
                  value={data.section}
                  onValueChange={(v) => update({ section: v === "none" ? "" : v })}
                  disabled={!data.division && divisions.length > 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={data.division || divisions.length === 0 ? "เลือกงาน/โรงเรียน (ข้ามได้)" : "กรุณาเลือกหน่วยงานย่อยก่อน"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่มี / ไม่ระบุ</SelectItem>
                    {sections.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {canContinue && (
              <div className="md:col-span-2 rounded-xl bg-accent/60 border border-secondary/30 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary flex-shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-sm leading-relaxed">
                  <div className="text-muted-foreground text-xs mb-0.5">หน่วยงานที่เลือก</div>
                  <div className="text-foreground">
                    {ORG_STRUCTURE.find((b) => b.value === data.bureau)?.label}
                    {data.division && " · " + divisions.find((d) => d.value === data.division)?.label}
                    {data.section && " · " + sections.find((s) => s.value === data.section)?.label}
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-1" /> กลับหน้าแรก
              </Link>
            </Button>
            <Button
              size="lg"
              onClick={onContinue}
              disabled={!canContinue}
              className="bg-primary hover:bg-primary-glow text-primary-foreground"
            >
              เริ่มทำแบบสำรวจ <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
