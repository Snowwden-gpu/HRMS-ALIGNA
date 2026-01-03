
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { 
  CreditCard, 
  Download, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Info, 
  ShieldCheck, 
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Building2,
  Wallet,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  History,
  Scale,
  X,
  FileSpreadsheet,
  Zap,
  RefreshCw,
  Search,
  // Added Save icon import
  Save
} from 'lucide-react';
import { UserRole, PayrollStatus, EmployeeProfile } from '../types';
import { MOCK_EMPLOYEES, formatINR } from '../constants';

export const Payroll: React.FC<{ user: any }> = ({ user }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [runStatus, setRunStatus] = useState<PayrollStatus>(PayrollStatus.FINANCE_REVIEW);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Persistence logic for Demo
  useEffect(() => {
    const savedStatus = localStorage.getItem('aligna_payroll_status');
    if (savedStatus) setRunStatus(savedStatus as PayrollStatus);
  }, []);

  const updateStatus = (newStatus: PayrollStatus, msg: string) => {
    setIsProcessing(newStatus);
    setTimeout(() => {
      setRunStatus(newStatus);
      localStorage.setItem('aligna_payroll_status', newStatus);
      setIsProcessing(null);
      showFeedback(msg, 'success');
    }, 1500);
  };

  const showFeedback = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDownload = (name: string) => {
    setIsProcessing(name);
    setTimeout(() => {
      setIsProcessing(null);
      showFeedback(`${name} generated successfully. Starting download...`);
    }, 1200);
  };

  // Calculate stats
  const totalOrgPayout = MOCK_EMPLOYEES.reduce((acc, curr) => acc + (curr.salary / 12), 0);
  const structure = user.profile.salaryStructure || { basic: 0, hra: 0, specialAllowance: 0, pf: 0, tds: 0, professionalTax: 0 };
  const earnings = structure.basic + structure.hra + structure.specialAllowance;
  const deductions = structure.pf + structure.tds + structure.professionalTax;
  const netPay = earnings - deductions;

  const StatusStepper = () => (
    <div className="flex items-center justify-between px-10 py-8 bg-white border border-slate-100 rounded-[32px] shadow-soft mb-8 overflow-x-auto gap-4">
      {[
        { id: PayrollStatus.DRAFT, label: 'Data Sync' },
        { id: PayrollStatus.VERIFICATION, label: 'Audit' },
        { id: PayrollStatus.FINANCE_REVIEW, label: 'Review' },
        { id: PayrollStatus.APPROVED, label: 'Approved' },
        { id: PayrollStatus.DISBURSED, label: 'Paid' }
      ].map((step, idx) => {
        const statusOrder = Object.values(PayrollStatus);
        const currentIdx = statusOrder.indexOf(runStatus);
        const isCompleted = idx < currentIdx;
        const isCurrent = step.id === runStatus;
        
        return (
          <React.Fragment key={step.id}>
            <div 
              className={`flex flex-col items-center gap-3 shrink-0 cursor-pointer transition-all ${isCurrent ? 'scale-110' : 'hover:opacity-80'}`}
              onClick={() => {
                if (idx <= currentIdx + 1) { // Allow moving forward one by one or backward for demo
                  setRunStatus(step.id as PayrollStatus);
                }
              }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 
                isCurrent ? 'border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-100' : 'border-slate-200 text-slate-300'
              }`}>
                {isCompleted ? <CheckCircle2 size={20} /> : <span className="font-bold text-sm">{idx + 1}</span>}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-teal-900' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < 4 && (
              <div className={`h-[2px] flex-1 min-w-[30px] rounded-full transition-all duration-1000 ${
                isCompleted ? 'bg-emerald-600' : 'bg-slate-100'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const AdminView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-8 right-8 z-[100] p-4 bg-emerald-900 text-white rounded-2xl shadow-premium border border-emerald-700 flex items-center gap-3 animate-in slide-in-from-right duration-500">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <span className="text-sm font-bold">{feedback.message}</span>
        </div>
      )}

      {/* Employee Detail Drawer */}
      {selectedEmp && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <img src={selectedEmp.avatar} className="w-14 h-14 rounded-2xl object-cover" />
                <div>
                  <h3 className="text-xl font-black text-teal-900 tracking-tight">{selectedEmp.fullName}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedEmp.employeeId} • {selectedEmp.position}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmp(null)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-emerald-50 border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Monthly Gross</p>
                  <p className="text-2xl font-black text-teal-900">{formatINR(selectedEmp.salary / 12)}</p>
                </Card>
                <Card className="p-6 bg-rose-50 border-rose-100">
                  <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Monthly Deductions</p>
                  <p className="text-2xl font-black text-teal-900">{formatINR((selectedEmp.salary / 12) * 0.15)}</p>
                </Card>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Salary Components</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Basic Salary', val: (selectedEmp.salary / 12) * 0.5 },
                    { label: 'HRA', val: (selectedEmp.salary / 12) * 0.2 },
                    { label: 'Special Allowance', val: (selectedEmp.salary / 12) * 0.3 },
                  ].map(comp => (
                    <div key={comp.label} className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">{comp.label}</span>
                      <span className="font-bold text-teal-900">{formatINR(comp.val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex gap-4">
                <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => handleDownload(`${selectedEmp.fullName} Payslip`)}>
                  <Download size={18} className="mr-2" /> Download Payslip
                </Button>
                <Button className="flex-1 rounded-2xl">
                  <Save size={18} className="mr-2" /> Edit Structure
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-teal-900 tracking-tighter">Payroll Command Center</h2>
          <p className="text-slate-500 font-semibold text-sm">Managing cycle for May 2024 • Disbursing on 01 Jun</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 bg-white rounded-xl shadow-sm"
            onClick={() => handleDownload('Payroll Archive')}
          >
             <History size={18} /> Archive
          </Button>
          
          {runStatus === PayrollStatus.FINANCE_REVIEW && (
            <Button 
              className="gap-2 shadow-premium rounded-xl px-8" 
              isLoading={isProcessing === PayrollStatus.APPROVED}
              onClick={() => updateStatus(PayrollStatus.APPROVED, 'Payroll confirmed and approved for disbursal.')}
            >
               <ShieldCheck size={18} /> Approve Bulk Payout
            </Button>
          )}

          {runStatus === PayrollStatus.APPROVED && (
            <Button 
              className="gap-2 shadow-premium rounded-xl px-8 bg-blue-600 hover:bg-blue-700" 
              isLoading={isProcessing === PayrollStatus.DISBURSED}
              onClick={() => updateStatus(PayrollStatus.DISBURSED, 'Funds disbursed. Notifications sent to all employees.')}
            >
               <DollarSign size={18} /> Disburse Funds
            </Button>
          )}

          {runStatus === PayrollStatus.DISBURSED && (
            <Badge type="success" className="px-8 py-3 rounded-xl text-sm border-emerald-500">Payout Completed</Badge>
          )}
        </div>
      </div>

      <StatusStepper />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <Card 
              className="p-6 bg-white border-none shadow-soft hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => showFeedback('Viewing Detailed Net Payout breakdown...', 'info')}
            >
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Net Payout</p>
               <h4 className="text-2xl font-black text-teal-900">{formatINR(totalOrgPayout * 0.8)}</h4>
               <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                 <TrendingUp size={12} /> +1.2% from April
               </p>
            </Card>
            <Card 
              className="p-6 bg-white border-none shadow-soft hover:shadow-lg transition-all cursor-pointer"
              onClick={() => showFeedback('Opening TDS Projection report...', 'info')}
            >
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tax Liability (TDS)</p>
               <h4 className="text-2xl font-black text-teal-900">{formatINR(totalOrgPayout * 0.12)}</h4>
               <p className="text-[11px] font-bold text-slate-400 mt-2">Due by 7th Jun</p>
            </Card>
            <Card 
              className="p-6 bg-white border-none shadow-soft hover:shadow-lg transition-all cursor-pointer"
              onClick={() => window.location.hash = '#/employees'}
            >
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Headcount Sync</p>
               <h4 className="text-2xl font-black text-teal-900">{MOCK_EMPLOYEES.length} Active</h4>
               <p className="text-[11px] font-bold text-amber-600 mt-2 flex items-center gap-1">
                 <AlertTriangle size={12} /> 1 New Joiner
               </p>
            </Card>
          </div>

          <Card className="overflow-hidden shadow-premium">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-white gap-4">
              <h3 className="font-bold text-teal-900">May 2024 Payout Register</h3>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    placeholder="Search register..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="bg-white rounded-xl" onClick={() => handleDownload('Master Register')}>
                  <FileSpreadsheet size={16} className="mr-2" /> Export
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductions</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_EMPLOYEES.filter(e => e.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => {
                    const monthly = emp.salary / 12;
                    const tds = monthly * 0.1;
                    const pf = monthly * 0.05;
                    return (
                      <tr 
                        key={emp.id} 
                        className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                        onClick={() => setSelectedEmp(emp)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <img src={emp.avatar} className="w-9 h-9 rounded-xl object-cover" />
                            <div>
                              <p className="text-[13px] font-bold text-teal-900">{emp.fullName}</p>
                              <p className="text-[10px] font-bold text-slate-400">{emp.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-[13px] font-bold text-teal-900">{formatINR(monthly)}</td>
                        <td className="px-6 py-5 text-[13px] font-bold text-rose-500">-{formatINR(tds + pf)}</td>
                        <td className="px-6 py-5 text-[14px] font-black text-emerald-700">{formatINR(monthly - tds - pf)}</td>
                        <td className="px-6 py-5">
                          <Badge type={runStatus === PayrollStatus.DISBURSED ? 'success' : 'info'}>
                            {runStatus === PayrollStatus.DISBURSED ? 'Paid' : 'Ready'}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 text-slate-300 group-hover:text-emerald-600 transition-colors">
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8 shadow-soft bg-emerald-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <Scale className="text-emerald-400 mb-6" size={28} />
            <h4 className="text-xl font-bold tracking-tight">Statutory Compliance</h4>
            <div className="mt-6 space-y-4">
               <div className="flex justify-between items-center text-sm group cursor-pointer" onClick={() => showFeedback('Opening TDS Filing console...')}>
                 <span className="text-emerald-100/60 font-medium group-hover:text-white transition-colors">Income Tax (TDS)</span>
                 <Badge type="success" className="bg-emerald-800 text-white border-transparent">FILED</Badge>
               </div>
               <div className="flex justify-between items-center text-sm group cursor-pointer" onClick={() => showFeedback('Uploading EPF ECR File...')}>
                 <span className="text-emerald-100/60 font-medium group-hover:text-white transition-colors">EPF Contributions</span>
                 <Badge type="warning" className="bg-emerald-800 text-white border-transparent">PENDING</Badge>
               </div>
               <div className="flex justify-between items-center text-sm group cursor-pointer" onClick={() => showFeedback('Opening ESI Monthly returns...')}>
                 <span className="text-emerald-100/60 font-medium group-hover:text-white transition-colors">ESI Submissions</span>
                 <Badge type="success" className="bg-emerald-800 text-white border-transparent">FILED</Badge>
               </div>
            </div>
            <Button 
              className="w-full bg-emerald-500 text-white hover:bg-emerald-400 mt-8 font-bold rounded-2xl border-none shadow-xl"
              onClick={() => handleDownload('Compliance Audit Report')}
              isLoading={isProcessing === 'Compliance Audit Report'}
            >
              Generate Audit Report
            </Button>
          </Card>

          <Card className="p-8 shadow-soft bg-white">
            <h3 className="font-bold text-teal-900 text-[14px] mb-8 flex items-center gap-3 uppercase tracking-widest">
              <Building2 size={18} className="text-emerald-600" /> Disbursal Channels
            </h3>
            <div className="space-y-4">
               <div 
                 className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
                 onClick={() => handleDownload('HDFC Corporate Banking File')}
               >
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] font-bold text-teal-900">HDFC Corporate File</p>
                    {isProcessing === 'HDFC Corporate Banking File' ? <RefreshCw size={16} className="text-emerald-500 animate-spin" /> : <Download size={16} className="text-slate-300 group-hover:text-emerald-500" />}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Download Transfer Sheet</p>
               </div>
               <div 
                 className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
                 onClick={() => showFeedback('Synchronization with ERP successful.')}
               >
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] font-bold text-teal-900">Accounting Ledger</p>
                    <ExternalLink size={16} className="text-slate-300 group-hover:text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Sync to Tally / SAP</p>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const EmployeeView = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-8 right-8 z-[100] p-4 bg-emerald-900 text-white rounded-2xl shadow-premium border border-emerald-700 flex items-center gap-3 animate-in slide-in-from-right duration-500">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <span className="text-sm font-bold">{feedback.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-teal-900 tracking-tighter">Wealth & Payouts</h2>
          <p className="text-slate-500 font-semibold mt-1">Review your earnings, tax projections, and compliance status.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 bg-white rounded-xl shadow-sm border-slate-200"
            onClick={() => showFeedback('Calculating Year-End Tax Projections...', 'info')}
          >
            <PieChart size={18} /> Tax Projections
          </Button>
          <Button 
            className="gap-2 shadow-premium rounded-xl px-10"
            onClick={() => handleDownload('May 2024 Payslip')}
            isLoading={isProcessing === 'May 2024 Payslip'}
          >
            <Download size={18} /> Download Payslip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-12 bg-white relative border-t-[8px] border-t-emerald-600 shadow-premium overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] grayscale pointer-events-none">
             <CreditCard size={320} />
          </div>
          
          <div className="flex justify-between items-start mb-20 relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-4">May 2024 Net Payout</p>
              <h3 className="text-7xl font-black text-teal-900 tracking-tighter">{formatINR(netPay)}</h3>
              <div className="mt-8 flex items-center gap-4">
                <Badge type="success" className="px-5 py-2 rounded-xl text-[11px]">CREDITED TO BANK</Badge>
                <p className="text-[13px] text-slate-400 font-bold">Ref: TXN-492028-AZ</p>
              </div>
            </div>
            <div className="p-8 bg-emerald-50 text-emerald-600 rounded-[32px] shadow-inner">
              <Wallet size={48} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pb-4 border-b border-slate-100 flex items-center justify-between">
                Earnings <span>{formatINR(earnings)}</span>
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-semibold text-sm">Basic Salary</span>
                  <span className="font-bold text-teal-900">{formatINR(structure.basic)}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-semibold text-sm">HRA</span>
                  <span className="font-bold text-teal-900">{formatINR(structure.hra)}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-semibold text-sm">Special Allowance</span>
                  <span className="font-bold text-teal-900">{formatINR(structure.specialAllowance)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pb-4 border-b border-slate-100 flex items-center justify-between">
                Statutory Deductions <span>{formatINR(deductions)}</span>
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-semibold text-sm">Provident Fund (EPF)</span>
                  <span className="font-bold text-rose-500">-{formatINR(structure.pf)}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-semibold text-sm">Income Tax (TDS)</span>
                  <span className="font-bold text-rose-500">-{formatINR(structure.tds)}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-semibold text-sm">Professional Tax</span>
                  <span className="font-bold text-rose-500">-{formatINR(structure.professionalTax)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 flex items-center gap-4 text-xs font-bold text-emerald-800 bg-emerald-50/50 p-6 rounded-[24px]">
            <ShieldCheck size={22} className="text-emerald-600" />
            This payslip is an electronically generated record and does not require a physical signature.
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="p-8 shadow-soft bg-white">
            <h3 className="font-bold text-teal-900 text-lg mb-8 flex items-center gap-3 uppercase tracking-tighter">
              <TrendingUp size={20} className="text-emerald-600" /> Payout History
            </h3>
            <div className="space-y-4">
              {['April 2024', 'March 2024', 'February 2024'].map((month, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#f0f9f1] transition-all duration-300 border border-transparent hover:border-emerald-100 group cursor-pointer"
                  onClick={() => handleDownload(`${month} Payslip`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 group-hover:bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-teal-900">{month}</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase">Credited: 1st</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-emerald-600">{formatINR(netPay)}</p>
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mt-6"
                onClick={() => showFeedback('Annual earnings summary is being generated...', 'info')}
              >
                View Annual Summary
              </Button>
            </div>
          </Card>

          <Card className="p-10 bg-teal-900 text-white shadow-premium relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
            <Info className="text-emerald-400 mb-8" size={32} />
            <h4 className="text-2xl font-bold tracking-tight">Form 16 & Tax Filing</h4>
            <p className="text-emerald-100/60 text-[14px] mt-4 leading-relaxed font-medium">
              Your annual tax statement for FY 23-24 is now available for download.
            </p>
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mt-10 font-bold rounded-2xl border-none h-14 text-base shadow-xl"
              onClick={() => handleDownload('Form 16 (FY 23-24)')}
              isLoading={isProcessing === 'Form 16 (FY 23-24)'}
            >
              Get Form 16
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );

  return isAdmin ? <AdminView /> : <EmployeeView />;
};
