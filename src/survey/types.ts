export type SurveyData = {
  // organization (selected before survey)
  bureau: string;
  division: string;
  section: string;

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
  bureau: "",
  division: "",
  section: "",
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

// Organization structure: สำนัก → กอง → ส่วน
export const ORG_STRUCTURE: {
  value: string;
  label: string;
  divisions: { value: string; label: string; sections: { value: string; label: string }[] }[];
}[] = [
  {
    value: "office_mayor",
    label: "สำนักปลัดเทศบาล",
    divisions: [
      {
        value: "admin",
        label: "กองบริหารงานทั่วไป",
        sections: [
          { value: "general", label: "ส่วนธุรการ" },
          { value: "personnel", label: "ส่วนการเจ้าหน้าที่" },
          { value: "public_service", label: "ส่วนบริการประชาชน" },
        ],
      },
      {
        value: "policy",
        label: "กองยุทธศาสตร์และงบประมาณ",
        sections: [
          { value: "plan", label: "ส่วนแผนและงบประมาณ" },
          { value: "research", label: "ส่วนวิจัยและประเมินผล" },
        ],
      },
    ],
  },
  {
    value: "office_finance",
    label: "สำนักการคลัง",
    divisions: [
      {
        value: "finance",
        label: "กองคลัง",
        sections: [
          { value: "accounting", label: "ส่วนการเงินและบัญชี" },
          { value: "revenue", label: "ส่วนพัฒนารายได้" },
          { value: "procurement", label: "ส่วนพัสดุและทรัพย์สิน" },
        ],
      },
    ],
  },
  {
    value: "office_public_works",
    label: "สำนักการช่าง",
    divisions: [
      {
        value: "engineering",
        label: "กองช่าง",
        sections: [
          { value: "civil", label: "ส่วนวิศวกรรมโยธา" },
          { value: "electric", label: "ส่วนไฟฟ้าและสื่อสาร" },
          { value: "maintenance", label: "ส่วนซ่อมบำรุง" },
        ],
      },
    ],
  },
  {
    value: "office_health",
    label: "สำนักการสาธารณสุขและสิ่งแวดล้อม",
    divisions: [
      {
        value: "health",
        label: "กองสาธารณสุข",
        sections: [
          { value: "promotion", label: "ส่วนส่งเสริมสุขภาพ" },
          { value: "environment", label: "ส่วนอนามัยสิ่งแวดล้อม" },
        ],
      },
    ],
  },
  {
    value: "office_education",
    label: "สำนักการศึกษา",
    divisions: [
      {
        value: "education",
        label: "กองการศึกษา",
        sections: [
          { value: "school", label: "ส่วนส่งเสริมการศึกษา" },
          { value: "culture", label: "ส่วนศาสนาและวัฒนธรรม" },
        ],
      },
    ],
  },
];
