import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowLeft } from "lucide-react";

const ADMIN_USER = "pop";
const ADMIN_PASS = "pop";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Always start from a logged-out state when the login page loads. Without
  // this, a stale `isAdmin` session from a previous login would let anyone
  // reach the dashboard regardless of the credentials entered here.
  useEffect(() => {
    sessionStorage.removeItem("isAdmin");
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem("isAdmin", "true");
      setError("");
      navigate("/admin/dashboard");
    } else {
      // Reject: ensure no session is granted and surface a visible error.
      sessionStorage.removeItem("isAdmin");
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link to="/" className="absolute top-6 left-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span className="text-sm">กลับหน้าแรก</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center bg-gradient-hero text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-1">ผู้ดูแลระบบ</h1>
          <p className="text-sm text-white/80">เข้าสู่ระบบเพื่อจัดการข้อมูล</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div role="alert" aria-live="assertive" className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">ชื่อผู้ใช้ (Username)</label>
            <Input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้"
              required
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">รหัสผ่าน (Password)</label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              required
              className="h-11"
            />
          </div>
          
          <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary-glow mt-4">
            เข้าสู่ระบบ
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
