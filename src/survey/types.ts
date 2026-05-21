export type SurveyData = {
  // metadata
  surveyDate: string;
  surveyor: string;
  team: string;
  department: string;
  building: string;
  floor: string;
  room: string;
  contactPerson: string;
  phone: string;

  // area
  areaType: string;
  areaTypeOther: string;
  roomSize: string;
  occupants: string;
  noiseLevel: string;
  announcementImportance: string;
  operatingHours: string;

  // current PA
  hasExistingSpeaker: string;
  existingCondition: string;
  problems: string[];
  problemsOther: string;
  photoName: string;

  // proposed
  proposedPosition: string;
  proposedCount: string;
  speakerType: string;
  speakerTypeOther: string;
  cableFeasibility: string;
  nearestPower: string;
  constraints: string;
  reasonForNeed: string;

  // technical checklist
  cableSafety: string;
  ceilingReadiness: string;
  powerAvailable: string;
  controlAvailable: string;
  maintenanceAccess: string;
  userImpact: string;
  suitability: string;
  riskNotes: string;

  // approval
  urgency: string;
  beneficiaries: string;
  officerNotes: string;
  signSurveyor: string;
  signTechnical: string;
  signDept: string;
  signApprover: string;
};

export const initialSurvey: SurveyData = {
  surveyDate: new Date().toISOString().slice(0, 10),
  surveyor: "นายสมชาย ใจดี",
  team: "ทีมสำรวจระบบเสียง ก.1",
  department: "งานบริการประชาชน",
  building: "อาคารสำนักงานเทศบาล",
  floor: "ชั้น 1",
  room: "ห้องประชุมใหญ่",
  contactPerson: "นางสาวกัลยา ศรีสุข",
  phone: "081-234-5678",

  areaType: "meeting",
  areaTypeOther: "",
  roomSize: "45",
  occupants: "30",
  noiseLevel: "medium",
  announcementImportance: "high",
  operatingHours: "08:30 - 16:30 น.",

  hasExistingSpeaker: "no",
  existingCondition: "fair",
  problems: ["no_coverage", "unclear"],
  problemsOther: "",
  photoName: "",

  proposedPosition: "บริเวณกลางฝ้าเพดานห้องประชุม และมุมห้องด้านทิศตะวันออก",
  proposedCount: "2",
  speakerType: "ceiling",
  speakerTypeOther: "",
  cableFeasibility: "feasible",
  nearestPower: "ตู้ควบคุมไฟฟ้าหลัก ชั้น 1 ห่างประมาณ 8 เมตร",
  constraints: "ต้องเดินสายเหนือฝ้าและประสานช่วงเวลานอกเวลาราชการ",
  reasonForNeed: "เพื่อรองรับการประชุมและประกาศข่าวสารแก่ประชาชนที่มาติดต่อ",

  cableSafety: "pass",
  ceilingReadiness: "pass",
  powerAvailable: "pass",
  controlAvailable: "improve",
  maintenanceAccess: "pass",
  userImpact: "low",
  suitability: "suitable",
  riskNotes: "ควรติดตั้งนอกเวลาราชการเพื่อลดผลกระทบ",

  urgency: "medium",
  beneficiaries: "ประชาชนผู้มาติดต่อราชการประมาณ 150 คน/วัน",
  officerNotes: "เห็นควรดำเนินการในไตรมาสถัดไป",
  signSurveyor: "นายสมชาย ใจดี",
  signTechnical: "",
  signDept: "",
  signApprover: "",
};

export const AREA_TYPES = [
  { value: "office", label: "ห้องทำงาน" },
  { value: "meeting", label: "ห้องประชุม" },
  { value: "counter", label: "เคาน์เตอร์บริการ" },
  { value: "corridor", label: "ทางเดิน/โถง" },
  { value: "hall", label: "ห้องโถง/ห้องอเนกประสงค์" },
  { value: "stairwell", label: "บันได/ทางหนีไฟ" },
  { value: "other", label: "อื่น ๆ" },
];

export const PROBLEM_OPTIONS = [
  { value: "no_coverage", label: "ไม่มีเสียงครอบคลุม" },
  { value: "unclear", label: "เสียงไม่ชัดเจน" },
  { value: "low_volume", label: "เสียงเบาเกินไป" },
  { value: "loud_volume", label: "เสียงดังเกินไป" },
  { value: "intermittent", label: "เสียงขาด ๆ หาย ๆ" },
  { value: "cable_damage", label: "สายสัญญาณชำรุด" },
  { value: "no_control", label: "ไม่มีจุดควบคุม" },
  { value: "other", label: "อื่น ๆ" },
];

export const SPEAKER_TYPES = [
  { value: "ceiling", label: "ลำโพงฝังฝ้าเพดาน" },
  { value: "wall", label: "ลำโพงติดผนัง" },
  { value: "horn", label: "ลำโพงฮอร์น" },
  { value: "pendant", label: "ลำโพงแขวน" },
  { value: "other", label: "อื่น ๆ" },
];
