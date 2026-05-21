import { SurveyData } from "./types";

export const validateStep = (step: number, d: SurveyData): Record<string, string> => {
  const e: Record<string, string> = {};
  const req = (k: keyof SurveyData, msg = "กรุณากรอกข้อมูลในช่องนี้") => {
    if (!String(d[k] ?? "").trim()) e[k as string] = msg;
  };
  if (step === 0) {
    req("surveyDate", "กรุณาเลือกวันที่");
    req("surveyor", "กรุณากรอกชื่อผู้สำรวจ");
    req("department");
    req("building");
    req("floor");
    req("room");
    req("phone", "กรุณากรอกเบอร์โทรศัพท์");
    if (d.phone && !/^[0-9\-+\s()]{8,}$/.test(d.phone)) e.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
  }
  if (step === 1) {
    req("areaType", "กรุณาเลือกประเภทพื้นที่");
    req("roomSize", "กรุณาระบุขนาดพื้นที่");
    req("occupants", "กรุณาระบุจำนวนผู้ใช้งาน");
    req("noiseLevel");
    req("announcementImportance");
  }
  if (step === 2) {
    req("hasExistingSpeaker", "กรุณาเลือกตัวเลือก");
  }
  if (step === 3) {
    req("proposedPosition", "กรุณาระบุตำแหน่งที่เสนอ");
    req("proposedCount", "กรุณาระบุจำนวนจุด");
    req("speakerType");
    req("cableFeasibility");
    req("reasonForNeed", "กรุณาระบุเหตุผลความจำเป็น");
  }
  if (step === 4) {
    req("userImpact");
    req("suitability");
  }
  if (step === 5) {
    req("urgency");
    req("beneficiaries", "กรุณาระบุจำนวนผู้ได้รับประโยชน์");
    req("signSurveyor", "กรุณาระบุชื่อผู้สำรวจ");
  }
  return e;
};
