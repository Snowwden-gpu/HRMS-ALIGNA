
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { 
  Users, 
  Clock, 
  CalendarCheck, 
  Wallet, 
  ArrowUpRight, 
  ChevronRight,
  TrendingUp,
  Briefcase,
  Calendar,
  Sparkles,
  Zap,
  CheckCircle2,
  Trophy,
  Activity,
  Cpu,
  Heart,
  Target,
  MessageSquare
} from 'lucide-react';
import { UserRole, AttendanceStatus, LeaveRequest, LeaveStatus } from '../types';
import { MOCK_ATTENDANCE, MOCK_LEAVES, MOCK_EMPLOYEES, formatINR } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { attendanceService } from '../services/attendanceService';

const AnimationStyles = () => (
  <style>{`
    .hero-gradient {
      background: linear-gradient(135deg, #064e3b 0%, #059669 100%);
      position: relative;
      overflow: hidden;
    }
    .hero-pattern {
      background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0);
      background-size: 24px 24px;
    }
    .pulse-glow {
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
  `}</style>
);

const MomentumCard = ({ score, label, icon: Icon, color }: any) => (
  <Card className="p-6 bg-white border-none shadow-soft flex items-center gap-5 group hover:shadow-md transition-all">
    <div className={`p-4 rounded-2xl ${color} text-white group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-teal-900">{score}</p>
    </div>
  </Card>
);

export const Dashboard: React.FC<{ user: any }> = ({ user }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [time, setTime] = useState(new Date());
  const [records, setRecords] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const fetchLeaves = () => {
    const savedLeaves = localStorage.getItem('aligna_leaves');
    const allLeaves: LeaveRequest[] = savedLeaves ? JSON.parse(savedLeaves) : MOCK_LEAVES;
    // Filter leaves for the current user if not admin
    if (user.role === UserRole.ADMIN) {
      setLeaves(allLeaves);
    } else {
      setLeaves(allLeaves.filter(l => l.employeeId === user.profile.employeeId));
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchLeaves();

    const unsubscribeAtt = attendanceService.subscribeToUserAttendance(user.profile.employeeId, (data) => {
      setRecords(data);
    });

    const handleLeavesUpdated = () => fetchLeaves();
    window.addEventListener('leaves_updated', handleLeavesUpdated);

    return () => {
      clearInterval(timer);
      unsubscribeAtt();
      window.removeEventListener('leaves_updated', handleLeavesUpdated);
    };
  }, [user.profile.employeeId]);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const streakCount = useMemo(() => {
    let count = 0;
    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
    for (const r of sorted) {
      if (r.status === 'Present') count++;
      else break;
    }
    return count;
  }, [records]);

  const productivityScore = useMemo(() => {
    const presentDays = records.filter(r => r.status === 'Present').length;
    return Math.min(100, Math.round((presentDays / 22) * 100 + 75)); 
  }, [records]);

  const leaveBalance = useMemo(() => {
    const approvedLeaves = leaves.filter(l => l.status === LeaveStatus.APPROVED);
    // Standard quota of 20 days per year
    return Math.max(0, 20 - approvedLeaves.length);
  }, [leaves]);

  const pendingLeavesCount = useMemo(() => {
    return leaves.filter(l => l.status === LeaveStatus.PENDING).length;
  }, [leaves]);

  const roleInsights = useMemo(() => {
    if (user.profile.department === 'Software Engineering') {
      return {
        title: 'Engineering Velocity',
        icon: <Cpu size={20} />,
        metrics: [
          { label: 'Uptime', value: '99.9%', trend: '+0.1%' },
          { label: 'PRs Merged', value: '12', trend: 'Active' },
          { label: 'System Health', value: 'Optimal', trend: 'Stable' }
        ],
        chartData: [
          { name: 'M', val: 80 }, { name: 'T', val: 85 }, { name: 'W', val: 92 }, { name: 'T', val: 88 }, { name: 'F', val: 95 }
        ]
      };
    }
    if (user.role === UserRole.ADMIN || user.profile.department === 'People Operations') {
      return {
        title: 'People Alignment',
        icon: <Heart size={20} />,
        metrics: [
          { label: 'Happiness Index', value: '8.4/10', trend: '+0.2' },
          { label: 'Engagement', value: '92%', trend: 'High' },
          { label: 'Retention', value: '98%', trend: 'Stable' }
        ],
        chartData: [
          { name: 'M', val: 70 }, { name: 'T', val: 75 }, { name: 'W', val: 72 }, { name: 'T', val: 78 }, { name: 'F', val: 80 }
        ]
      };
    }
    return {
      title: 'Workflow Pulse',
      icon: <Target size={20} />,
      metrics: [
        { label: 'Tasks Done', value: '45', trend: 'Weekly' },
        { label: 'Efficiency', value: '88%', trend: '+2%' },
        { label: 'Alignment', value: 'Strong', trend: 'Target' }
      ],
      chartData: [
        { name: 'M', val: 60 }, { name: 'T', val: 65 }, { name: 'W', val: 70 }, { name: 'T', val: 68 }, { name: 'F', val: 72 }
      ]
    };
  }, [user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <AnimationStyles />

      <section className="hero-gradient rounded-[48px] p-10 shadow-premium group">
        <div className="absolute inset-0 hero-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="text-center lg:text-left space-y-5">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <Badge className="bg-white/15 text-white border-transparent backdrop-blur-md px-4 py-1.5 rounded-full font-bold">
                {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </Badge>
              {streakCount > 2 && (
                <Badge className="bg-amber-400 text-amber-900 border-transparent px-4 py-1.5 rounded-full font-black flex items-center gap-1.5">
                  <Zap size={14} fill="currentColor" /> {streakCount} DAY STREAK
                </Badge>
              )}
            </div>
            
            <h1 className="text-5xl font-black text-white tracking-tight leading-[1.1]">
              {getGreeting()},<br />
              <span className="text-emerald-100">{user.profile.fullName.split(' ')[0]}</span>
            </h1>
            
            <p className="max-w-md text-emerald-50/70 font-medium text-lg">
              You're making a great impact as our <span className="text-white font-bold">{user.profile.position}</span>. Here's what's happening in <span className="text-white font-bold">Aligna</span> today.
            </p>

            <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
              <Button 
                onClick={() => window.location.hash = '#/attendance'} 
                className="bg-white text-emerald-800 hover:bg-emerald-50 shadow-2xl px-12 h-14 rounded-[20px] font-black text-base transition-all hover:scale-105 active:scale-95"
              >
                Log Attendance
              </Button>
              <Button 
                variant="glass" 
                className="px-8 h-14 rounded-[20px] text-white border-white/20 hover:bg-white/10"
                onClick={() => window.location.hash = '#/leaves'}
              >
                Time Off
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-200">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-sm font-bold text-emerald-100 opacity-60 uppercase tracking-widest">Today</p>
              <p className="text-2xl font-black text-white mt-1">Checked In</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-200">
                <Calendar size={24} />
              </div>
              <p className="text-sm font-bold text-emerald-100 opacity-60 uppercase tracking-widest">Upcoming</p>
              <p className="text-2xl font-black text-white mt-1">Pay Day (1st)</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MomentumCard score={`${productivityScore}%`} label="Work Velocity" icon={TrendingUp} color="bg-emerald-500" />
        <MomentumCard score={streakCount.toString()} label="Activity Streak" icon={Zap} color="bg-amber-500" />
        <MomentumCard score={leaveBalance.toString()} label="Leave Balance" icon={CalendarCheck} color="bg-blue-500" />
        <MomentumCard score={formatINR(user.profile.salary / 12)} label="Next Payout" icon={Wallet} color="bg-teal-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 bg-white shadow-soft border-none overflow-hidden relative">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  {roleInsights.icon}
                </div>
                <h3 className="text-xl font-black text-teal-900 tracking-tight">{roleInsights.title}</h3>
              </div>
              <Badge type="info" className="px-4 py-1.5 rounded-full font-bold">Real-time Feed</Badge>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
              {roleInsights.metrics.map((m, i) => (
                <div key={i} className="p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-teal-900">{m.value}</p>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={roleInsights.chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                  <YAxis hide />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)'}} />
                  <Area type="monotone" dataKey="val" stroke="#059669" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="bg-amber-50 rounded-[32px] p-8 border border-amber-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="w-20 h-20 bg-amber-400 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-amber-200 shrink-0">
              <Trophy size={40} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-xl font-black text-amber-900">May Performance Milestone</h4>
              <p className="text-amber-800/70 font-bold mt-1">You've reached <span className="text-amber-900">98% attendance accuracy</span> this month. Keep the momentum going!</p>
            </div>
            <Button variant="outline" className="bg-white border-amber-200 text-amber-700 font-black rounded-xl px-6">
              View Badges
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="p-8 bg-white shadow-soft">
            <h3 className="font-black text-teal-900 text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
              <Activity size={18} className="text-emerald-500" /> Work Pulse
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Sync Attendance', status: 'Completed', icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
                { label: 'Approval Queue', status: isAdmin ? `${pendingLeavesCount} Pending` : (pendingLeavesCount > 0 ? `${pendingLeavesCount} Applied` : 'Clear'), icon: <Clock size={16} className="text-amber-500" /> },
                { label: 'Identity Review', status: 'Required', icon: <Briefcase size={16} className="text-slate-400" /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-900">{item.label}</span>
                  </div>
                  <Badge type="neutral" className="bg-white text-[9px] font-black">{item.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-teal-900 text-white shadow-premium relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
             <h3 className="font-black text-emerald-400 text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
               <Sparkles size={18} /> Social Hub
             </h3>
             <div className="flex items-center gap-4 mb-6">
               <div className="flex -space-x-3">
                  {MOCK_EMPLOYEES.slice(0, 4).map((e, i) => (
                    <img key={i} src={e.avatar} className="w-10 h-10 rounded-full border-2 border-teal-900 ring-2 ring-emerald-500/20" alt="Avatar" />
                  ))}
               </div>
               <p className="text-xs font-bold text-emerald-100/60">+12 others online</p>
             </div>
             <p className="text-sm font-medium text-emerald-100 leading-relaxed italic border-l-2 border-emerald-500 pl-4 py-1">
               "Great work on the Q2 performance report, Priya!"
             </p>
             <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest text-emerald-100">
               <MessageSquare size={16} /> Open Team Chat
             </button>
          </Card>

          <Card className="p-8 bg-white shadow-soft text-center group cursor-pointer hover:shadow-md transition-all" onClick={() => window.location.hash = '#/profile'}>
             <div className="relative inline-block mb-6">
               <img src={user.profile.avatar} className="w-24 h-24 rounded-[32px] object-cover ring-4 ring-slate-50 group-hover:ring-emerald-50 transition-all" alt="Self" />
               <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg animate-bounce">
                 <Sparkles size={16} />
               </div>
             </div>
             <h4 className="text-xl font-black text-teal-900 tracking-tight">{user.profile.fullName}</h4>
             <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-1.5">{user.profile.position}</p>
             <div className="mt-8 flex justify-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xs">A</div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">★</div>
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-black text-xs">L3</div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
