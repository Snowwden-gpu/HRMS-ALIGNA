
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/UI';
import { MOCK_EMPLOYEES } from '../constants';
import { 
  Eye,
  EyeOff,
  Activity,
  BarChart3,
  Target,
  Users,
  ArrowRight,
  AlertCircle,
  Shield,
  Building2,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const AnimationStyles = () => (
  <style>{`
    .auth-page-wrapper {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      position: relative;
      overflow: hidden;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-page-wrapper::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 20% 30%, rgba(5, 150, 105, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(13, 148, 136, 0.08) 0%, transparent 50%);
      pointer-events: none;
    }
    .left-panel-gradient {
      background: linear-gradient(165deg, #134e4a 0%, #065f46 50%, #064e3b 100%);
      position: relative;
    }
    .grid-overlay {
      background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.6;
    }
    .interactive-card {
      position: relative;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      padding: 1.75rem;
      transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      transform-style: preserve-3d;
      cursor: pointer;
      overflow: hidden;
    }
    .interactive-card::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.08), transparent 40%);
      opacity: 0;
      transition: opacity 0.5s;
    }
    .interactive-card:hover::after {
      opacity: 1;
    }
    .interactive-card:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow: 0 20px 40px rgba(0, 78, 59, 0.3);
    }
    .icon-container {
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .interactive-card:hover .icon-container {
      transform: scale(1.1) rotate(5deg);
    }
    .auth-container {
      box-shadow: 0 40px 100px -20px rgba(4, 120, 87, 0.12), 0 20px 40px -20px rgba(0, 0, 0, 0.1);
      background: #fdfdfd;
      min-height: 720px;
    }
    .form-input-container {
      position: relative;
      transition: all 0.3s;
    }
    .form-input {
      background-color: #f3f5f6;
      border: 1.5px solid transparent;
      border-radius: 14px;
      padding: 12px 16px 12px 48px;
      font-size: 14px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      color: #1e293b;
      font-weight: 500;
    }
    .form-input:focus {
      background-color: #ffffff;
      border-color: #059669;
      outline: none;
      box-shadow: 0 0 0 5px rgba(5, 150, 105, 0.08);
    }
    .form-input-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      transition: color 0.3s;
    }
    .form-input:focus + .form-input-icon {
      color: #059669;
    }
    .strength-bar {
      height: 4px;
      border-radius: 2px;
      background: #e2e8f0;
      margin-top: 8px;
      overflow: hidden;
      position: relative;
    }
    .strength-progress {
      height: 100%;
      transition: all 0.5s ease;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .floating-sparkle {
      animation: float 3s ease-in-out infinite;
    }
    .btn-emerald-pill {
      background: #059669;
      color: #ffffff;
      border-radius: 9999px;
      font-weight: 700;
      box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.25);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-emerald-pill:hover:not(:disabled) {
      background: #047857;
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(5, 150, 105, 0.35);
    }
  `}</style>
);

const InteractiveCard: React.FC<{ 
  title: string; 
  subtitle: string; 
  icon: React.ReactNode;
  variant?: 'green' | 'blue' | 'white' | 'teal';
}> = ({ title, subtitle, icon, variant = 'green' }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'white': return 'bg-white text-slate-900';
      default: return 'text-white';
    }
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`interactive-card ${variant === 'white' ? 'bg-white shadow-xl border-white' : ''} ${getVariantStyles()}`}
    >
      <div className={`icon-container w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${variant === 'white' ? 'bg-emerald-50 text-emerald-600' : 'bg-white/10 text-white'}`}>
        {icon}
      </div>
      <h3 className="text-lg font-black tracking-tight mb-2">{title}</h3>
      <p className={`text-xs leading-relaxed font-semibold opacity-60`}>{subtitle}</p>
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export const Auth: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleSelection, setRoleSelection] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length > 7) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthColor = strength <= 25 ? 'bg-rose-500' : strength <= 50 ? 'bg-amber-500' : strength <= 75 ? 'bg-blue-500' : 'bg-emerald-500';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (mode === 'signin') {
        const emailKey = email.toLowerCase();
        const foundEmployee = MOCK_EMPLOYEES.find(emp => emp.email.toLowerCase() === emailKey);
        
        if (foundEmployee) {
          onLogin({ id: foundEmployee.id, email: foundEmployee.email, role: foundEmployee.role, profile: foundEmployee });
          return;
        }
        setError('The corporate credentials provided are incorrect.');
      } else {
        setError('Your application has been received. Admin approval is required for new corporate domains.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="auth-page-wrapper px-4 lg:px-12">
      <AnimationStyles />
      
      <div className="relative w-full max-w-[1140px] flex auth-container rounded-[44px] overflow-hidden z-10 transition-all duration-500">
        
        {/* Left Panel: Feature Grid */}
        <div className="hidden lg:flex w-1/2 relative p-16 flex-col justify-between left-panel-gradient overflow-hidden">
          <div className="absolute inset-0 grid-overlay"></div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-bold text-xl border border-white/30">A</div>
               <span className="text-2xl font-black tracking-tighter text-white">Aligna</span>
             </div>
             <p className="mt-4 text-emerald-100/60 font-bold text-sm tracking-widest uppercase">The Operating System for People</p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-6 max-w-lg mx-auto">
            <InteractiveCard 
              title="Operational Excellence" 
              subtitle="Unified management for the modern enterprise." 
              icon={<Activity size={24} />}
              variant="green"
            />
            <InteractiveCard 
              title="Strategic Alignment" 
              subtitle="Connect individual performance to corporate vision." 
              icon={<Target size={24} />}
              variant="blue"
            />
            <InteractiveCard 
              title="Data-Driven Insights" 
              subtitle="Live workforce intelligence at your fingertips." 
              icon={<BarChart3 size={24} />}
              variant="white"
            />
            <InteractiveCard 
              title="Global Collaboration" 
              subtitle="Foster high-performance teams across borders." 
              icon={<Users size={24} />}
              variant="teal"
            />
          </div>

          <div className="relative z-10 flex items-center gap-4 text-white/40">
            <Sparkles size={20} className="floating-sparkle text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-[0.3em]">Join 500+ High-Performance Organizations</span>
          </div>
        </div>

        {/* Right Panel: Form Area */}
        <div className="w-full lg:w-1/2 p-10 lg:p-20 flex flex-col justify-center bg-[#fdfdfd] relative">
          <div className="max-w-md mx-auto w-full">
            
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-[36px] font-black tracking-tight text-slate-900 mb-2">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400 font-bold text-[15px]">
                {mode === 'signin' 
                  ? 'Enter your corporate credentials to continue.' 
                  : 'Start your 14-day free trial. No credit card required.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-input-container">
                    <input 
                      className="form-input w-full"
                      placeholder="Full Name" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    <User className="form-input-icon" size={18} />
                  </div>
                  <div className="form-input-container">
                    <input 
                      className="form-input w-full"
                      placeholder="Company Name" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                    <Building2 className="form-input-icon" size={18} />
                  </div>
                </div>
              )}

              <div className="form-input-container">
                <input 
                  type="email"
                  className="form-input w-full"
                  placeholder="Work Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="form-input-icon" size={18} />
              </div>

              <div className="space-y-1">
                <div className="form-input-container">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input w-full"
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <Lock className="form-input-icon" size={18} />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mode === 'signup' && password && (
                  <div className="px-1">
                    <div className="strength-bar">
                      <div className={`strength-progress ${strengthColor}`} style={{ width: `${strength}%` }}></div>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-wider">
                      Security: {strength < 50 ? 'Weak' : strength < 100 ? 'Moderate' : 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              {mode === 'signup' && (
                <>
                  <div className="form-input-container">
                    <input 
                      type="password"
                      className="form-input w-full"
                      placeholder="Confirm Password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                    <CheckCircle2 className="form-input-icon" size={18} />
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Your Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRoleSelection('EMPLOYEE')}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${roleSelection === 'EMPLOYEE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        <User size={16} /> Employee
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoleSelection('ADMIN')}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${roleSelection === 'ADMIN' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        <Shield size={16} /> HR Admin
                      </button>
                    </div>
                    {roleSelection === 'ADMIN' && (
                      <p className="text-[10px] font-bold text-amber-600 mt-2 flex items-center gap-1">
                         <AlertCircle size={12} /> Admin privileges require verified corporate domain.
                      </p>
                    )}
                  </div>
                </>
              )}

              {mode === 'signin' && (
                <div className="text-right">
                  <button type="button" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Forgot password?</button>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in fade-in duration-300">
                  <AlertCircle size={18} className="text-rose-500 shrink-0" />
                  <p className="text-sm text-rose-600 font-bold leading-tight">{error}</p>
                </div>
              )}

              <button 
                className="btn-emerald-pill w-full h-[56px] flex items-center justify-center gap-3 disabled:opacity-50 mt-4 text-base tracking-tight" 
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Dashboard' : 'Create My Account'}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-sm font-bold text-slate-400">
                {mode === 'signin' ? "New to the platform?" : "Already managing with us?"}
                {' '}
                <button 
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }} 
                  className="text-emerald-600 font-black hover:underline underline-offset-8 transition-all"
                >
                  {mode === 'signin' ? 'Get Started Free' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-10 left-0 w-full flex flex-col items-center gap-1 opacity-40 select-none pointer-events-none">
        <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-teal-900">Enterprise Grade • GDPR Compliant • AES-256 Encryption</p>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-[10px] font-bold text-teal-900">Made by Caffeine & Code</p>
          <div className="w-1 h-1 rounded-full bg-teal-900/40"></div>
          <p className="text-[10px] font-bold text-teal-900">03-01-2026</p>
        </div>
      </footer>
    </div>
  );
};
