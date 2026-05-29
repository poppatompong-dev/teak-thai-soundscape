import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Filter, MapPin, Search, Speaker, Activity, Clock, ShieldAlert, LogOut, Loader2, FileText, QrCode, X, Trash2, Edit, Settings, ArrowDownUp, EyeOff, Eye, FlaskConical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ORG_STRUCTURE, SPEAKER_TYPES, STATUS_OPTIONS } from "@/survey/types";
import { isLikelyTest, formatThaiDateTime, applyFilters, filtersToParams, type SurveyFilters } from "@/survey/surveyUtils";
import * as XLSX from "xlsx";
import { QRCodeCanvas } from "qrcode.react";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, withRetry } from "@/lib/firebase";

const labelFrom = (list: { value: string; label: string }[], v: string) => list.find((x) => x.value === v)?.label ?? v;

const getDeptName = (bureau: string, div: string) => {
  const b = ORG_STRUCTURE.find(x => x.value === bureau);
  const d = b?.divisions?.find(x => x.value === div);
  if (d) return d.label;
  return b?.label || bureau;
};

const urgencyBadge = (urgency: string) => {
  switch (urgency) {
    case "high": return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">ด่วนมาก</span>;
    case "medium": return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">ปานกลาง</span>;
    case "low": return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">ทั่วไป</span>;
    default: return null;
  }
};

const statusBadge = (status: string = "pending") => {
  const s = STATUS_OPTIONS.find(x => x.value === status);
  if (!s) return null;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color} ${s.bg} border border-${s.color.replace('text-', '')}/20`}>{s.label}</span>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState(window.location.origin);

  const [filterBureau, setFilterBureau] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hideTest, setHideTest] = useState(false);
  const [sortKey, setSortKey] = useState("newest");

  const [settings, setSettings] = useState({ 
    isOpen: true, 
    openDate: "2026-05-01", 
    closeDate: "2026-07-30",
    orgName: "",
    surveyTitle: "",
    surveyDescription: "",
    contactInfo: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await withRetry(() => getDocs(collection(db, "surveys")));
        const data = querySnapshot.docs.map(doc => doc.data());
        setRequests(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch surveys", err);
        setLoading(false);
      }

      try {
        const docSnap = await withRetry(() => getDoc(doc(db, "config", "settings")));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.isOpen !== undefined) setSettings(data as any);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchData();
  }, []);

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      await setDoc(doc(db, "config", "settings"), newSettings);
      setSettings(newSettings);
      toast({ title: "อัปเดตการตั้งค่าระบบเรียบร้อยแล้ว" });
    } catch (err) {
      toast({ title: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า", variant: "destructive" });
    }
  };

  const [editingRequest, setEditingRequest] = useState<any>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(`คุณต้องการลบข้อมูล ${id} ใช่หรือไม่?`)) return;
    try {
      await deleteDoc(doc(db, "surveys", id));
      setRequests(reqs => reqs.filter(r => r.id !== id));
      toast({ title: "ลบข้อมูลสำเร็จ" });
    } catch (err) {
      toast({ title: "เกิดข้อผิดพลาดในการลบข้อมูล", variant: "destructive" });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "surveys", editingRequest.id), editingRequest);
      setRequests(reqs => reqs.map(r => r.id === editingRequest.id ? editingRequest : r));
      setEditingRequest(null);
      toast({ title: "บันทึกข้อมูลสำเร็จ" });
    } catch (err) {
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    navigate("/");
  };

  const exportToExcel = () => {
    const data = filteredRequests;
    const pts = (r: any) => parseInt(r.proposedCount) || 0;
    const urgencyTH = (u: string) => (u === "high" ? "สูง" : u === "medium" ? "ปานกลาง" : "ต่ำ");
    const wb = XLSX.utils.book_new();

    // ชีต 0: สรุปผู้บริหาร
    const totalPoints = data.reduce((a, r) => a + pts(r), 0);
    const bureaus = new Set(data.map(r => r.bureau)).size;
    const exec = [
      ["รายงานสรุปผลการสำรวจความต้องการ"],
      [settings.surveyTitle || ""],
      [settings.orgName || ""],
      [],
      ["ออกรายงานเมื่อ", new Date().toLocaleString("th-TH")],
      [],
      ["จำนวนคำขอทั้งหมด", `${data.length} รายการ`],
      ["รวมจุดที่ขอติดตั้ง", `${totalPoints} จุด`],
      ["จำนวนหน่วยงานที่แจ้ง", `${bureaus} หน่วยงาน`],
      ["รายการด่วนมาก (สูง)", `${data.filter(r => r.urgency === "high").length} รายการ`],
      ["รอดำเนินการ", `${data.filter(r => (r.status || "pending") === "pending").length} รายการ`],
    ];
    const wsE = XLSX.utils.aoa_to_sheet(exec);
    wsE["!cols"] = [{ wch: 30 }, { wch: 48 }];
    XLSX.utils.book_append_sheet(wb, wsE, "0.สรุปผู้บริหาร");

    // ชีต 1: ข้อมูลดิบทั้งหมด
    const rawData = data.map((r, i) => ({
      "ลำดับ": i + 1,
      "รหัสอ้างอิง": r.id,
      "วันเวลาที่ตอบ": formatThaiDateTime(r),
      "หน่วยงานหลัก": ORG_STRUCTURE.find(x => x.value === r.bureau)?.label || r.bureau,
      "หน่วยงานย่อย": getDeptName(r.bureau, r.division),
      "ระดับปฏิบัติการ": r.section || "-",
      "อาคาร": r.building,
      "ชั้น": r.floor,
      "ห้อง/บริเวณ": r.room,
      "ประเภทความต้องการ": labelFrom(SPEAKER_TYPES, r.speakerType),
      "จำนวน (จุด)": pts(r),
      "ความเร่งด่วน": urgencyTH(r.urgency),
      "สถานะ": labelFrom(STATUS_OPTIONS, r.status || "pending"),
      "เหตุผลความจำเป็น": r.reasonForNeed,
      "ผู้ได้รับประโยชน์": r.beneficiaries || "-",
      "ผู้ประสานงาน": r.surveyor || r.contactPerson || "-",
      "เบอร์โทรติดต่อ": r.phone || "-",
    }));
    const ws1 = XLSX.utils.json_to_sheet(rawData);
    ws1["!cols"] = Object.keys(rawData[0] || {}).map(k => ({ wch: Math.max(k.length + 2, 12) }));
    XLSX.utils.book_append_sheet(wb, ws1, "1.ข้อมูลดิบทั้งหมด");

    // ชีต 2: สรุปตามหน่วยงาน
    const byB: Record<string, { count: number; points: number; high: number }> = {};
    data.forEach(r => {
      const k = ORG_STRUCTURE.find(x => x.value === r.bureau)?.label || r.bureau || "ไม่ระบุ";
      byB[k] = byB[k] || { count: 0, points: 0, high: 0 };
      byB[k].count++; byB[k].points += pts(r);
      if (r.urgency === "high") byB[k].high++;
    });
    const sum2 = Object.entries(byB)
      .map(([k, v]) => ({ "หน่วยงาน": k, "จำนวนคำขอ": v.count, "รวมจุด": v.points, "ด่วนมาก": v.high }))
      .sort((a, b) => b["รวมจุด"] - a["รวมจุด"]);
    sum2.push({ "หน่วยงาน": "รวมทั้งสิ้น", "จำนวนคำขอ": data.length, "รวมจุด": totalPoints, "ด่วนมาก": data.filter(r => r.urgency === "high").length });
    const ws2 = XLSX.utils.json_to_sheet(sum2);
    ws2["!cols"] = [{ wch: 40 }, { wch: 12 }, { wch: 10 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws2, "2.สรุปตามหน่วยงาน");

    XLSX.writeFile(wb, `รายงานสรุปแบบสำรวจ_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const testCount = requests.filter(isLikelyTest).length;

  // Single source of truth for filtering+sorting, shared with the printed report.
  const filters: SurveyFilters = {
    search: searchQuery, bureau: filterBureau, category: filterCategory,
    urgency: filterUrgency, status: filterStatus, hideTest, sortKey,
  };
  const sortedRequests = applyFilters(requests, filters);
  // Stat cards reflect exactly what is shown (same filtered set).
  const filteredRequests = sortedRequests;

  const highUrgencyCount = filteredRequests.filter(r => r.urgency === "high").length;
  const pendingCount = filteredRequests.filter(r => (r.status || "pending") === "pending").length;
  const uniqueBuildings = new Set(filteredRequests.map(r => r.building)).size;

  const dashboardStats = [
    { label: "รายการคำขอทั้งหมด", value: filteredRequests.length.toString(), unit: "รายการ", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "รวมจำนวนจุด/หน่วย", value: filteredRequests.reduce((acc, r) => acc + (parseInt(r.proposedCount) || 0), 0).toString(), unit: "จุด", icon: Speaker, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "อาคารที่เกี่ยวข้อง", value: uniqueBuildings.toString(), unit: "อาคาร", icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "รอดำเนินการ", value: pendingCount.toString(), unit: "รายการ", icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 leading-tight">Admin Dashboard</h1>
                <p className="text-[10px] text-slate-500 font-medium">ระบบรวบรวมคำขอเสียงตามสาย</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => setShowQrModal(true)} className="hidden sm:flex text-slate-600 bg-white border-slate-200 hover:bg-slate-50">
              <QrCode className="w-4 h-4 mr-2" /> QR Code
            </Button>
            <Button asChild size="sm" variant="outline" className="hidden sm:flex text-slate-600 bg-white border-slate-200 hover:bg-slate-50">
              <Link to={`/admin/report${filtersToParams(filters) ? `?${filtersToParams(filters)}` : ""}`}><FileText className="w-4 h-4 mr-2" /> พิมพ์รายงาน (PDF)</Link>
            </Button>
            <Button size="sm" onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <Download className="w-4 h-4 mr-2" /> ส่งออก Excel
            </Button>
            <Button size="sm" variant="outline" onClick={handleLogout} className="border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
              <LogOut className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">ออกจากระบบ</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">ภาพรวมการสำรวจ (Overview)</h2>
            <p className="text-sm text-slate-500 mt-1">ข้อมูลดึงตรงจากฐานข้อมูล Firestore (เรียลไทม์)</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Settings className="w-4 h-4 text-slate-400" /> สถานะระบบ: 
                <span className={`px-2 py-0.5 rounded text-xs ${settings.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {settings.isOpen ? 'เปิดใช้งาน' : 'ปิดระบบ'}
                </span>
              </div>
              <Button size="sm" variant={settings.isOpen ? "destructive" : "default"} className={`h-8 w-full sm:w-auto ${!settings.isOpen ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`} onClick={() => handleUpdateSettings({...settings, isOpen: !settings.isOpen})}>
                {settings.isOpen ? 'บังคับปิด (Override)' : 'เปิดใช้งาน'}
              </Button>
            </div>

            <div className="h-px w-full bg-slate-100"></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm w-full">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-slate-600 whitespace-nowrap">เปิดรับตั้งแต่:</span>
                <Input type="date" value={settings.openDate || ""} onChange={(e) => setSettings({...settings, openDate: e.target.value})} className="h-8 w-full sm:w-[130px] text-xs" />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-slate-600 whitespace-nowrap">ถึง:</span>
                <Input type="date" value={settings.closeDate || ""} onChange={(e) => setSettings({...settings, closeDate: e.target.value})} className="h-8 w-full sm:w-[130px] text-xs" />
              </div>
              <Button size="sm" onClick={() => handleUpdateSettings(settings)} className="h-8 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm mt-2 sm:mt-0">บันทึกเวลา</Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {dashboardStats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm flex items-start justify-between transition-all hover:shadow-md hover:border-slate-300">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">{stat.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{stat.value}</span>
                  <span className="text-sm font-medium text-slate-500">{stat.unit}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-3">
            <h3 className="font-semibold text-slate-800">ตั้งค่าข้อมูลแบบสำรวจ (Survey Configuration)</h3>
            <Button size="sm" onClick={() => handleUpdateSettings(settings)} className="bg-primary hover:bg-primary-glow text-white w-full sm:w-auto">บันทึกข้อมูลแบบสำรวจ</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-700">ชื่อแบบสำรวจ</label>
              <Input value={settings.surveyTitle || ""} onChange={(e) => setSettings({...settings, surveyTitle: e.target.value})} placeholder="เช่น แบบสำรวจจุดติดตั้งเสียงตามสาย (PA)" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-700">ชื่อหน่วยงาน / องค์กร</label>
              <Input value={settings.orgName || ""} onChange={(e) => setSettings({...settings, orgName: e.target.value})} placeholder="เช่น เทศบาลนครนครสวรรค์" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block text-slate-700">คำอธิบายและวัตถุประสงค์</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={settings.surveyDescription || ""} 
                onChange={(e) => setSettings({...settings, surveyDescription: e.target.value})}
                placeholder="อธิบายรายละเอียดหรือแนะนำแบบสำรวจ..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block text-slate-700">ข้อมูลการติดต่อ (เบอร์โทร, ห้อง)</label>
              <Input value={settings.contactInfo || ""} onChange={(e) => setSettings({...settings, contactInfo: e.target.value})} placeholder="เช่น ติดต่อ: กองยุทธศาสตร์ โทร. 4212" />
            </div>
          </div>
        </div>

        {/* Data Table Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="font-semibold text-slate-800">รายการแจ้งความต้องการ</h3>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ค้นหาหน่วยงาน, อาคาร, รหัสอ้างอิง..." className="pl-9 h-9 text-sm bg-white border-slate-300 transition-shadow focus-visible:ring-1 focus-visible:ring-primary" />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500 w-full sm:w-auto">
                <Filter className="w-4 h-4" /> ตัวกรอง:
              </div>
              <select className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary" value={filterBureau} onChange={e => setFilterBureau(e.target.value)}>
                <option value="all">ทุกหน่วยงาน</option>
                {ORG_STRUCTURE.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">ทุกประเภท</option>
                {SPEAKER_TYPES.filter(t => t.value !== "other").map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary" value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
                <option value="all">ทุกความเร่งด่วน</option>
                <option value="high">สูง</option>
                <option value="medium">ปานกลาง</option>
                <option value="low">ต่ำ</option>
              </select>
              <select className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">ทุกสถานะ</option>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <ArrowDownUp className="w-4 h-4 text-slate-400" />
                <select className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary" value={sortKey} onChange={e => setSortKey(e.target.value)}>
                  <option value="newest">เรียง: ใหม่สุดก่อน</option>
                  <option value="oldest">เรียง: เก่าสุดก่อน</option>
                  <option value="points_desc">เรียง: จำนวนจุด (มาก→น้อย)</option>
                  <option value="points_asc">เรียง: จำนวนจุด (น้อย→มาก)</option>
                  <option value="urgency">เรียง: ความเร่งด่วน</option>
                  <option value="bureau">เรียง: หน่วยงาน (ก-ฮ)</option>
                </select>
              </div>

              {/* Hide test data */}
              <Button
                size="sm"
                variant={hideTest ? "default" : "outline"}
                onClick={() => setHideTest(v => !v)}
                className={`h-9 ${hideTest ? "bg-slate-700 hover:bg-slate-800 text-white" : "border-slate-300 text-slate-600"}`}
                title="ซ่อน/แสดงข้อมูลที่ระบบสันนิษฐานว่าเป็นข้อมูลทดสอบ"
              >
                {hideTest ? <Eye className="w-4 h-4 mr-1.5" /> : <EyeOff className="w-4 h-4 mr-1.5" />}
                {hideTest ? "แสดงข้อมูลทดสอบ" : "ซ่อนข้อมูลทดสอบ"}
                {testCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">{testCount}</span>}
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ref ID / วันเวลาที่ตอบ</th>
                  <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">หน่วยงาน</th>
                  <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">สถานที่</th>
                  <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">รายละเอียดความต้องการ</th>
                  <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">ความเร่งด่วน</th>
                  <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">สถานะ</th>
                  <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : sortedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500 bg-slate-50">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                        <Filter className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="text-base font-semibold text-slate-700 mb-1">ไม่พบข้อมูล</h4>
                      <p className="text-sm">ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา/ตัวกรองของคุณ</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => {
                        setSearchQuery("");
                        setFilterBureau("all");
                        setFilterCategory("all");
                        setFilterUrgency("all");
                        setFilterStatus("all");
                      }}>ล้างตัวกรอง</Button>
                    </td>
                  </tr>
                ) : (
                  sortedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">{req.id}</span>
                          {isLikelyTest(req) && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700 border border-orange-200" title="ระบบสันนิษฐานว่าเป็นข้อมูลทดสอบ">
                              <FlaskConical className="w-3 h-3" /> ทดสอบ
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{formatThaiDateTime(req)}</div>
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-700">{getDeptName(req.bureau, req.division)}</td>
                      <td className="py-4 px-5 text-sm text-slate-700">{req.building} {req.floor && `(${req.floor})`}</td>
                      <td className="py-4 px-5 text-sm text-slate-700">{labelFrom(SPEAKER_TYPES, req.speakerType)} จำนวน <span className="font-semibold text-slate-900">{req.proposedCount}</span> หน่วย</td>
                      <td className="py-4 px-5 text-center">
                        {urgencyBadge(req.urgency)}
                      </td>
                      <td className="py-4 px-5 text-center">
                        {statusBadge(req.status)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" onClick={() => setEditingRequest(req)} className="h-8 w-8 p-0 text-slate-500 hover:text-primary hover:bg-primary/5 hover:border-primary/20">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(req.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
            <div>แสดง {filteredRequests.length > 0 ? 1 : 0} ถึง {filteredRequests.length} จากทั้งหมด {filteredRequests.length} รายการ</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled className="h-8">ก่อนหน้า</Button>
              <Button variant="outline" size="sm" disabled className="h-8">ถัดไป</Button>
            </div>
          </div>
        </div>

      </main>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><QrCode className="w-5 h-5 text-primary"/> สร้าง QR Code</h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-full mb-6">
                <label className="text-sm font-medium text-slate-700 mb-1 block">ลิงก์แบบสำรวจ</label>
                <Input value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder="https://your-vercel-app.vercel.app" />
                <p className="text-xs text-muted-foreground mt-2">ระบบดึง URL ปัจจุบันมาสร้าง QR Code อัตโนมัติ (รองรับลิงก์บน Vercel)</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                <QRCodeCanvas id="survey-qr" value={qrUrl || "https://soundscape-survey.vercel.app"} size={200} level="H" includeMargin={true} />
              </div>
              <Button onClick={() => {
                const canvas = document.getElementById("survey-qr") as HTMLCanvasElement;
                if (canvas) {
                  const url = canvas.toDataURL("image/png");
                  const link = document.createElement("a");
                  link.download = "survey-qrcode.png";
                  link.href = url;
                  link.click();
                }
              }} className="w-full bg-primary hover:bg-primary-glow text-white">
                <Download className="w-4 h-4 mr-2" /> ดาวน์โหลด QR Code (PNG)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">แก้ไขข้อมูล: {editingRequest.id}</h3>
              <button onClick={() => setEditingRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">สถานที่ (อาคาร)</label>
                <Input required value={editingRequest.building} onChange={(e) => setEditingRequest({...editingRequest, building: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">จำนวนที่ต้องการ</label>
                <Input type="number" min="1" required value={editingRequest.proposedCount} onChange={(e) => setEditingRequest({...editingRequest, proposedCount: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ความเร่งด่วน</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editingRequest.urgency} onChange={(e) => setEditingRequest({...editingRequest, urgency: e.target.value})}>
                  <option value="high">สูง</option>
                  <option value="medium">ปานกลาง</option>
                  <option value="low">ต่ำ</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">สถานะดำเนินการ</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editingRequest.status || "pending"} onChange={(e) => setEditingRequest({...editingRequest, status: e.target.value})}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-2">บันทึกการแก้ไข</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
