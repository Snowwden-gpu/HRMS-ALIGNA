
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, Input } from '../components/UI';
import { 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  X,
  ChevronDown
} from 'lucide-react';
import { UserRole, AttendanceStatus, AttendanceRecord } from '../types';
import { attendanceService, formatDuration } from '../services/attendanceService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';

export const Attendance: React.FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    minHours: ''
  });

  const isAdmin = user.role === UserRole.ADMIN;
  const employeeId = user.profile.employeeId;

  useEffect(() => {
    let unsubscribe: () => void;
    if (isAdmin) {
      unsubscribe = attendanceService.subscribeToAllAttendance((liveRecords) => {
        setRecords(liveRecords);
      });
    } else {
      unsubscribe = attendanceService.subscribeToUserAttendance(employeeId, (liveRecords) => {
        setRecords(liveRecords);
      });
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, [employeeId, isAdmin]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date === todayStr && r.employeeId === employeeId);

  const handleCheckIn = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      await attendanceService.checkIn(employeeId);
      setFeedback({ message: "Successfully checked in.", type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message || "Attendance failed", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      await attendanceService.checkOut(employeeId);
      setFeedback({ message: "Successfully checked out.", type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message || "Attendance failed", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = !searchTerm || 
        r.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.date.includes(searchTerm) || 
        r.status.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDateRange = (!filters.startDate || r.date >= filters.startDate) &&
                               (!filters.endDate || r.date <= filters.endDate);
      
      const matchesStatus = !filters.status || r.status === filters.status;
      
      const matchesMinHours = !filters.minHours || (r.workHoursMs / 3600000) >= parseFloat(filters.minHours);

      return matchesSearch && matchesDateRange && matchesStatus && matchesMinHours;
    });
  }, [records, searchTerm, filters]);

  // Analytics Derived Data
  const analyticsData = useMemo(() => {
    if (filteredRecords.length === 0) return null;

    const totalHoursMs = filteredRecords.reduce((acc, r) => acc + (r.workHoursMs || 0), 0);
    const avgHoursMs = totalHoursMs / filteredRecords.filter(r => r.status !== 'Absent' && r.status !== 'Leave').length;
    
    const statusCounts = filteredRecords.reduce((acc: any, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));

    const trendData = [...filteredRecords].reverse().slice(-14).map(r => ({
      date: r.date.split('-').slice(1).join('/'),
      hours: parseFloat((r.workHoursMs / 3600000).toFixed(1))
    }));

    return {
      totalHours: formatDuration(totalHoursMs),
      avgHours: formatDuration(avgHoursMs),
      pieData,
      trendData,
      presenceRate: ((statusCounts['Present'] || 0) / filteredRecords.length * 100).toFixed(1)
    };
  }, [filteredRecords]);

  const handleExport = () => {
    const headers = ["Date", "Employee ID", "Check In", "Check Out", "Work Hours", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredRecords.map(r => [
        r.date,
        r.employeeId,
        r.entry,
        r.exit,
        r.workHours,
        r.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Aligna_Attendance_${employeeId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusType = (status: string) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Partial': return 'warning';
      case 'Leave': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {feedback && (
        <div className="fixed top-8 right-8 z-[100] p-4 rounded-2xl shadow-premium border flex items-center gap-3 animate-in slide-in-from-right duration-500 bg-emerald-50 border-emerald-100 text-emerald-800">
          <CheckCircle2 size={20} />
          <span className="text-sm font-bold">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 opacity-50 hover:opacity-100">×</button>
        </div>
      )}

      {/* Check-In/Out Portal */}
      <Card className="p-8 bg-white overflow-hidden relative shadow-premium border-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
              <Clock size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-teal-900 tracking-tight">Daily Command</h3>
              <p className="text-slate-500 text-sm font-medium">Log your shift presence securely.</p>
              {todayRecord && !todayRecord.checkOut && (
                <Badge type="success" className="mt-2">Shift In Progress</Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end bg-slate-50 px-8 py-4 rounded-[24px] border border-slate-100 min-w-[180px]">
            <p className="text-3xl font-black text-teal-900 tabular-nums">
              {todayRecord?.entry || '--:--'}
            </p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Logged In</p>
          </div>

          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="px-12 py-4 text-base shadow-xl"
              onClick={handleCheckIn}
              disabled={isLoading || (!!todayRecord && !todayRecord.checkOut)}
              isLoading={isLoading && !todayRecord?.checkIn}
            >
              Check In
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-12 py-4 text-base bg-white border-slate-200"
              onClick={handleCheckOut}
              disabled={!todayRecord || !!todayRecord.checkOut || isLoading}
            >
              Check Out
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-full w-fit shadow-sm">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`px-8 py-2.5 text-[13px] font-black rounded-full transition-all ${activeTab === 'daily' ? 'bg-[#059669] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            DAILY LOG
          </button>
          <button 
            onClick={() => setActiveTab('monthly')}
            className={`px-8 py-2.5 text-[13px] font-black rounded-full transition-all ${activeTab === 'monthly' ? 'bg-[#059669] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ANALYTICS
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 bg-white rounded-xl py-2.5 px-6 font-bold" onClick={handleExport}>
            <Download size={16} /> Export CSV
          </Button>
          <Button size="sm" className="gap-2 rounded-xl py-2.5 px-6 font-bold" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} /> {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-6 bg-emerald-900 text-white animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-300">From Date</label>
              <input 
                type="date" 
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-300">To Date</label>
              <input 
                type="date" 
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Classification</label>
              <select 
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="" className="text-slate-900">All Statuses</option>
                <option value="Present" className="text-slate-900">Present</option>
                <option value="Partial" className="text-slate-900">Partial</option>
                <option value="Absent" className="text-slate-900">Absent</option>
                <option value="Leave" className="text-slate-900">Leave</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="glass" className="w-full font-bold text-white border-white/20" onClick={() => setFilters({startDate: '', endDate: '', status: '', minHours: ''})}>
                Reset All Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'daily' ? (
        <Card className="overflow-hidden shadow-soft border-none bg-white">
          <div className="p-5 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none"
                placeholder="Deep search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {isAdmin && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>}
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exit</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Hours</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-emerald-50/30 transition-colors group">
                    {isAdmin && (
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-teal-900">{record.employeeId}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-8 py-5 text-sm font-bold text-slate-600 tracking-tight">{record.date}</td>
                    <td className="px-8 py-5 text-sm text-slate-900 font-mono">{record.entry}</td>
                    <td className="px-8 py-5 text-sm text-slate-900 font-mono">{record.exit}</td>
                    <td className="px-8 py-5 text-sm font-black text-teal-800">{record.workHours}</td>
                    <td className="px-8 py-5">
                      <Badge type={getStatusType(record.status)}>{record.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="py-24 text-center">
                <div className="flex flex-col items-center opacity-20">
                   <Clock size={64} />
                   <p className="mt-4 font-black text-xl">No records matching your search.</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-7 bg-white">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Hours</p>
               <h4 className="text-3xl font-black text-teal-900">{analyticsData?.totalHours || '--'}</h4>
               <Badge type="info" className="mt-4">Cumulative</Badge>
            </Card>
            <Card className="p-7 bg-white">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg Hours/Day</p>
               <h4 className="text-3xl font-black text-teal-900">{analyticsData?.avgHours || '--'}</h4>
               <div className="mt-4 flex items-center gap-1 text-emerald-600 font-bold text-xs">
                 <TrendingUp size={14} /> Healthy Trend
               </div>
            </Card>
            <Card className="p-7 bg-white">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Presence Rate</p>
               <h4 className="text-3xl font-black text-teal-900">{analyticsData?.presenceRate}%</h4>
               <Badge type="success" className="mt-4">High Performance</Badge>
            </Card>
            <Card className="p-7 bg-emerald-900 text-white">
               <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-2">Cycle Period</p>
               <h4 className="text-xl font-bold">May 2024</h4>
               <p className="text-xs text-emerald-100/50 mt-4">Current evaluation window</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-8 bg-white h-[450px]">
              <h4 className="font-black text-teal-900 mb-8 flex items-center gap-2">
                <BarChart3 size={20} className="text-emerald-600" /> Work Duration Velocity (Past 14 Days)
              </h4>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={analyticsData?.trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'}}
                  />
                  <Bar dataKey="hours" fill="#059669" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-8 bg-white h-[450px]">
              <h4 className="font-black text-teal-900 mb-8 flex items-center gap-2">
                <PieChartIcon size={20} className="text-emerald-600" /> Classification Mix
              </h4>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={analyticsData?.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData?.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#059669', '#10b981', '#fbbf24', '#f43f5e'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                 {analyticsData?.pieData.map((d, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: ['#059669', '#10b981', '#fbbf24', '#f43f5e'][i % 4]}}></div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
                   </div>
                 ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
