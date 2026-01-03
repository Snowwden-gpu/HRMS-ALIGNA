
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, Input } from '../components/UI';
import { CalendarRange, Plus, Check, X, FileText, Send, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole, LeaveType, LeaveStatus, LeaveRequest } from '../types';
import { MOCK_LEAVES } from '../constants';

export const Leaves: React.FC<{ user: any }> = ({ user }) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // New Leave Form State
  const [newLeave, setNewLeave] = useState({
    type: LeaveType.PAID,
    startDate: '',
    endDate: '',
    reason: ''
  });

  const isAdmin = user.role === UserRole.ADMIN;

  const loadLeaves = () => {
    const savedLeaves = localStorage.getItem('aligna_leaves');
    if (savedLeaves) {
      setLeaves(JSON.parse(savedLeaves));
    } else {
      setLeaves(MOCK_LEAVES);
      localStorage.setItem('aligna_leaves', JSON.stringify(MOCK_LEAVES));
    }
  };

  useEffect(() => {
    loadLeaves();
    const handleLeavesUpdated = () => loadLeaves();
    window.addEventListener('leaves_updated', handleLeavesUpdated);
    return () => window.removeEventListener('leaves_updated', handleLeavesUpdated);
  }, []);

  const saveLeaves = (updatedLeaves: LeaveRequest[]) => {
    setLeaves(updatedLeaves);
    localStorage.setItem('aligna_leaves', JSON.stringify(updatedLeaves));
    // Dispatch custom event for real-time sync across components
    window.dispatchEvent(new Event('leaves_updated'));
  };

  const handleAction = (id: string, newStatus: LeaveStatus) => {
    if (!isAdmin) return;
    
    const updated = leaves.map(leave => 
      leave.id === id ? { ...leave, status: newStatus } : leave
    );
    
    saveLeaves(updated);
    setFeedback({
      message: `Request successfully ${newStatus.toLowerCase()}.`,
      type: newStatus === LeaveStatus.APPROVED ? 'success' : 'error'
    });

    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;

    const request: LeaveRequest = {
      id: `l_${Date.now()}`,
      employeeId: user.profile.employeeId,
      employeeName: user.profile.fullName,
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason,
      status: LeaveStatus.PENDING,
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const updated = [request, ...leaves];
    saveLeaves(updated);
    
    setShowApplyModal(false);
    setNewLeave({
      type: LeaveType.PAID,
      startDate: '',
      endDate: '',
      reason: ''
    });

    setFeedback({
      message: "Leave application submitted successfully.",
      type: 'success'
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const userLeaves = useMemo(() => {
    return isAdmin ? leaves : leaves.filter(l => l.employeeId === user.profile.employeeId);
  }, [leaves, isAdmin, user.profile.employeeId]);

  const stats = useMemo(() => {
    const approved = userLeaves.filter(l => l.status === LeaveStatus.APPROVED);
    const sick = approved.filter(l => l.type === LeaveType.SICK).length;
    const paid = approved.filter(l => l.type === LeaveType.PAID).length;
    const unpaid = approved.filter(l => l.type === LeaveType.UNPAID).length;

    return {
      paidBalance: Math.max(0, 14 - paid),
      sickBalance: Math.max(0, 8 - sick),
      unpaidTaken: unpaid
    };
  }, [userLeaves]);
  
  const getLeaveBadgeType = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED: return 'success';
      case LeaveStatus.PENDING: return 'warning';
      case LeaveStatus.REJECTED: return 'error';
      default: return 'neutral';
    }
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case LeaveType.SICK: return 'text-rose-600 bg-rose-50';
      case LeaveType.PAID: return 'text-emerald-600 bg-emerald-50';
      case LeaveType.UNPAID: return 'text-slate-600 bg-slate-50';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {feedback && (
        <div className={`fixed top-8 right-8 z-[100] p-4 rounded-2xl shadow-premium border flex items-center gap-3 animate-in slide-in-from-right duration-500 ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{feedback.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leave Application</h2>
          <p className="text-slate-500 text-sm">Request and manage your time off requests.</p>
        </div>
        {!isAdmin && (
          <Button className="gap-2 shadow-lg shadow-blue-100" onClick={() => setShowApplyModal(true)}>
            <Plus size={18} /> Apply for Leave
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Annual Leave Balance</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.paidBalance}</p>
              <p className="text-xs text-emerald-600 font-medium">+2 earned this month</p>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-emerald-500 flex items-center justify-center font-bold text-xs text-slate-900">
              {Math.round((stats.paidBalance / 14) * 100)}%
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Sick Leave Remaining</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.sickBalance}</p>
              <p className="text-xs text-slate-400 font-medium">Resetting in Jan 2025</p>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-blue-500 flex items-center justify-center font-bold text-xs text-slate-900">
              {Math.round((stats.sickBalance / 8) * 100)}%
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Unpaid Taken</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.unpaidTaken}</p>
              <p className="text-xs text-rose-600 font-medium">May affect payroll</p>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-slate-300 flex items-center justify-center font-bold text-xs text-slate-900">
              --
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{isAdmin ? 'All Requests' : 'Your Leave History'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Employee</th>}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Reason</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userLeaves.map(leave => (
                <tr key={leave.id} className="hover:bg-slate-50/50">
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200" />
                        <span className="text-sm font-medium text-slate-900">{leave.employeeName}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-tighter ${getLeaveTypeColor(leave.type)}`}>
                      {leave.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{leave.startDate}</p>
                    <p className="text-xs text-slate-400">to {leave.endDate}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{leave.reason}</td>
                  <td className="px-6 py-4">
                    <Badge type={getLeaveBadgeType(leave.status)}>{leave.status}</Badge>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      {leave.status === LeaveStatus.PENDING ? (
                        <div className="flex gap-2">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleAction(leave.id, LeaveStatus.APPROVED)}
                          >
                            <Check size={14} />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleAction(leave.id, LeaveStatus.REJECTED)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-slate-400">
                          <Info size={14} />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {userLeaves.length === 0 && (
            <div className="py-12 text-center text-slate-400 font-medium">No leave requests found.</div>
          )}
        </div>
      </Card>

      {/* Leave Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">New Leave Request</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitLeave} className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                 <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white transition-all text-slate-900"
                    value={newLeave.type}
                    onChange={(e) => setNewLeave({...newLeave, type: e.target.value as LeaveType})}
                    required
                 >
                   <option value={LeaveType.PAID}>Annual Leave (Paid)</option>
                   <option value={LeaveType.SICK}>Sick Leave</option>
                   <option value={LeaveType.UNPAID}>Unpaid Leave</option>
                 </select>
               </div>
               <Input 
                 label="Start Date" 
                 type="date" 
                 value={newLeave.startDate}
                 onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                 required
               />
               <Input 
                 label="End Date" 
                 type="date" 
                 value={newLeave.endDate}
                 onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                 required
               />
               <div className="col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                 <textarea 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm h-24 focus:outline-none focus:bg-white transition-all text-slate-900 placeholder:text-slate-400" 
                    placeholder="Briefly explain your request..."
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                    required
                 ></textarea>
               </div>
               <div className="col-span-2 flex gap-3 justify-end pt-4">
                 <Button type="button" variant="ghost" onClick={() => setShowApplyModal(false)}>Cancel</Button>
                 <Button type="submit" className="gap-2 px-8">
                   <Send size={16} /> Submit Request
                 </Button>
               </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
