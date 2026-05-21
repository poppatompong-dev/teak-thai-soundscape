export type SurveyData = {
  // organization (selected before survey)
  bureau: string;
  division: string;
  section: string;

  // Step 1: Location & Contact
  surveyDate: string;
  surveyor: string;
  building: string;
  floor: string;
  room: string;
  contactPerson: string;
  phone: string;

  // Step 2: Proposed Requirements
  problems: string[];
  problemsOther: string;
  speakerType: string;
  speakerTypeOther: string;
  proposedCount: string;
  proposedPosition: string;
  photoName: string;

  // Step 3: Budgeting & Feedback
  reasonForNeed: string;
  beneficiaries: string;
  urgency: string;
  comments: string;
  satisfaction: string;
};

export const initialSurvey: SurveyData = {
  bureau: "",
  division: "",
  section: "",
  
  // Step 1
  surveyDate: new Date().toISOString().slice(0, 10),
  surveyor: "",
  building: "อาคารสำนักงานเทศบาล",
  floor: "ชั้น 1",
  room: "",
  contactPerson: "",
  phone: "",

  // Step 2
  problems: [],
  problemsOther: "",
  speakerType: "ceiling",
  speakerTypeOther: "",
  proposedCount: "1",
  proposedPosition: "",
  photoName: "",

  // Step 3
  reasonForNeed: "",
  beneficiaries: "",
  urgency: "medium",
  comments: "",
  satisfaction: "5",
};

export const PROBLEM_OPTIONS = [
  { value: "no_coverage", label: "ไม่มีลำโพงเดิม / เสียงไม่ครอบคลุม" },
  { value: "unclear", label: "อุปกรณ์เดิมชำรุด / เสียงไม่ชัด" },
  { value: "other", label: "อื่น ๆ" },
];

export const SPEAKER_TYPES = [
  { value: "ceiling", label: "ลำโพงฝังฝ้าเพดาน (สำหรับห้องประชุม/สำนักงาน)" },
  { value: "wall", label: "ลำโพงติดผนัง (สำหรับโถงทางเดิน/ที่โล่ง)" },
  { value: "horn", label: "ลำโพงฮอร์น (สำหรับกระจายเสียงระยะไกล)" },
  { value: "other", label: "อื่น ๆ" },
];

// Organization structure based on nsm.go.th
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
        value: "general_admin",
        label: "ฝ่ายบริหารงานทั่วไป",
        sections: [
          { value: "general", label: "งานธุรการ" },
          { value: "public_relations", label: "งานประชาสัมพันธ์" },
        ],
      },
      {
        value: "governance",
        label: "ฝ่ายปกครอง",
        sections: [
          { value: "registration", label: "งานทะเบียนราษฎร" },
          { value: "security", label: "งานป้องกันและบรรเทาสาธารณภัย" },
        ],
      },
    ],
  },
  {
    value: "bureau_works",
    label: "สำนักช่าง",
    divisions: [
      {
        value: "engineering",
        label: "ส่วนวิศวกรรมการก่อสร้าง",
        sections: [
          { value: "civil", label: "งานวิศวกรรมโยธา" },
          { value: "architecture", label: "งานสถาปัตยกรรม" },
        ],
      },
      {
        value: "maintenance",
        label: "ส่วนการโยธา",
        sections: [
          { value: "public_utilities", label: "งานสาธารณูปโภค" },
          { value: "parks", label: "งานสวนสาธารณะ" },
        ],
      },
    ],
  },
  {
    value: "bureau_finance",
    label: "สำนักคลัง",
    divisions: [
      {
        value: "finance",
        label: "ส่วนบริหารการคลัง",
        sections: [
          { value: "accounting", label: "งานการเงินและบัญชี" },
          { value: "procurement", label: "งานพัสดุและทรัพย์สิน" },
        ],
      },
      {
        value: "revenue",
        label: "ส่วนพัฒนารายได้",
        sections: [
          { value: "tax", label: "งานจัดเก็บรายได้" },
          { value: "asset", label: "งานทะเบียนและแผนที่ภาษี" },
        ],
      },
    ],
  },
  {
    value: "bureau_health",
    label: "สำนักสาธารณสุขและสิ่งแวดล้อม",
    divisions: [
      {
        value: "health_promotion",
        label: "ส่วนบริการสาธารณสุข",
        sections: [
          { value: "clinic", label: "งานศูนย์บริการสาธารณสุข" },
          { value: "disease_control", label: "งานป้องกันและควบคุมโรค" },
        ],
      },
      {
        value: "environment",
        label: "ส่วนสิ่งแวดล้อม",
        sections: [
          { value: "sanitation", label: "งานสุขาภิบาล" },
          { value: "waste_management", label: "งานจัดการมูลฝอย" },
        ],
      },
    ],
  },
  {
    value: "bureau_education",
    label: "สำนักการศึกษา",
    divisions: [
      {
        value: "education_admin",
        label: "ส่วนบริหารการศึกษา",
        sections: [
          { value: "school_admin", label: "งานบริหารงานบุคคลทางการศึกษา" },
          { value: "plan", label: "งานแผนและวิชาการ" },
        ],
      },
      {
        value: "culture",
        label: "ส่วนส่งเสริมการศึกษา ศาสนา และวัฒนธรรม",
        sections: [
          { value: "activities", label: "งานกิจกรรมเด็กและเยาวชน" },
          { value: "sports", label: "งานกีฬาและนันทนาการ" },
        ],
      },
    ],
  },
  {
    value: "bureau_waterworks",
    label: "สำนักการประปา",
    divisions: [
      {
        value: "water_production",
        label: "ส่วนผลิตน้ำประปา",
        sections: [
          { value: "production", label: "งานผลิต" },
          { value: "quality", label: "งานควบคุมคุณภาพน้ำ" },
        ],
      },
      {
        value: "water_service",
        label: "ส่วนบริการและจัดเก็บรายได้",
        sections: [
          { value: "service", label: "งานบริการผู้ใช้น้ำ" },
          { value: "meter", label: "งานจดมาตรและจัดเก็บ" },
        ],
      },
    ],
  },
  {
    value: "div_strategy",
    label: "กองยุทธศาสตร์และงบประมาณ",
    divisions: [
      {
        value: "strategy_plan",
        label: "ฝ่ายแผนงานและงบประมาณ",
        sections: [
          { value: "planning", label: "งานวิเคราะห์นโยบายและแผน" },
          { value: "budgeting", label: "งานงบประมาณ" },
        ],
      },
    ],
  },
  {
    value: "div_welfare",
    label: "กองสวัสดิการสังคม",
    divisions: [
      {
        value: "social_work",
        label: "ฝ่ายสังคมสงเคราะห์",
        sections: [
          { value: "welfare", label: "งานสวัสดิการสังคม" },
          { value: "community", label: "งานพัฒนาชุมชน" },
        ],
      },
    ],
  },
  {
    value: "div_tax_info",
    label: "กองสารสนเทศภาษีและทะเบียนทรัพย์สิน",
    divisions: [
      {
        value: "tax_info",
        label: "ฝ่ายระบบสารสนเทศ",
        sections: [
          { value: "data", label: "งานฐานข้อมูล" },
          { value: "mapping", label: "งานแผนที่ภาษี" },
        ],
      },
    ],
  },
  {
    value: "div_personnel",
    label: "กองการเจ้าหน้าที่",
    divisions: [
      {
        value: "hr",
        label: "ฝ่ายบริหารงานบุคคล",
        sections: [
          { value: "recruitment", label: "งานสรรหาและบรรจุแต่งตั้ง" },
          { value: "records", label: "งานทะเบียนประวัติ" },
        ],
      },
    ],
  },
  {
    value: "unit_audit",
    label: "หน่วยตรวจสอบภายใน",
    divisions: [
      {
        value: "audit",
        label: "งานตรวจสอบภายใน",
        sections: [
          { value: "audit_general", label: "งานตรวจสอบทั่วไป" },
        ],
      },
    ],
  },
  {
    value: "schools",
    label: "โรงเรียนสังกัดเทศบาล",
    divisions: [
      {
        value: "school_group_1",
        label: "กลุ่มโรงเรียน 1",
        sections: [
          { value: "t1", label: "โรงเรียนเทศบาลวัดไทรใต้" },
          { value: "t2", label: "โรงเรียนเทศบาลวัดปากน้ำโพใต้" },
          { value: "t3", label: "โรงเรียนเทศบาลวัดพรหมจริยาวาส" },
        ],
      },
      {
        value: "school_group_2",
        label: "กลุ่มโรงเรียน 2",
        sections: [
          { value: "t4", label: "โรงเรียนเทศบาลวัดวรนาถบรรพต" },
          { value: "t5", label: "โรงเรียนเทศบาลวัดช่องคีรีฯ" },
          { value: "t6", label: "โรงเรียนเทศบาลวัดเขาจอมคีรีฯ" },
        ],
      },
      {
        value: "school_group_3",
        label: "กลุ่มโรงเรียน 3",
        sections: [
          { value: "t7", label: "โรงเรียนเทศบาลวัดสุคตวราราม" },
          { value: "t8", label: "โรงเรียนเทศบาลวัดไทรเหนือ" },
          { value: "t9", label: "โรงเรียนกีฬาเทศบาล(สนามกีฬากลาง)" },
        ],
      },
    ],
  },
];
