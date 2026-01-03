
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Input, Badge } from '../components/UI';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Edit3, Save, Globe, Linkedin, Twitter, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole, EmployeeProfile } from '../types';
import { profileService } from '../services/profileService';

export const Profile: React.FC<{ user: any; onUpdateSession?: (profile: any) => void }> = ({ user: currentUser, onUpdateSession }) => {
  const { employeeId } = useParams<{ employeeId?: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [displayUser, setDisplayUser] = useState<EmployeeProfile | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    department: '',
    avatar: ''
  });

  const isAdmin = currentUser.role === UserRole.ADMIN;

  // Load the employee data either from local storage or mock defaults
  const loadEmployeeData = () => {
    const db = profileService.getEmployees();
    const target = employeeId 
      ? db.find(e => e.id === employeeId || e.employeeId === employeeId) 
      : db.find(e => e.id === currentUser.profile.id);

    if (target) {
      setDisplayUser(target);
      setFormData({
        fullName: target.fullName,
        email: target.email,
        phone: target.phone,
        address: target.address,
        position: target.position,
        department: target.department,
        avatar: target.avatar
      });
    }
  };

  useEffect(() => {
    loadEmployeeData();
    window.addEventListener('profile_updated', loadEmployeeData);
    return () => window.removeEventListener('profile_updated', loadEmployeeData);
  }, [employeeId, currentUser]);

  if (!displayUser) return <div className="p-8 text-center text-slate-400">Loading identity profile...</div>;

  const getManagerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const managerName = displayUser.managerName || 'Sidharth Shukla';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const result = await profileService.updateProfile(
      { id: currentUser.profile.id, role: currentUser.role },
      displayUser.id,
      formData
    );

    if (result.status === 'success') {
      setFeedback({ message: result.message, type: 'success' });
      setIsEditing(false);
      if (onUpdateSession && result.updatedProfile) {
        onUpdateSession(result.updatedProfile);
      }
      loadEmployeeData();
    } else {
      setFeedback({ message: result.message, type: 'error' });
    }
    
    setIsSaving(false);
    setTimeout(() => setFeedback(null), 5000);
  };

  const isEditable = (field: string) => {
    if (isAdmin) return true;
    return ['phone', 'address', 'avatar'].includes(field);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {feedback && (
        <div className={`fixed top-8 right-8 z-[200] p-4 rounded-2xl shadow-premium border flex items-center gap-3 animate-in slide-in-from-right duration-500 ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 opacity-50 hover:opacity-100">×</button>
        </div>
      )}

      <div className="relative px-8 pb-8 flex flex-col md:flex-row items-end gap-6 border-b border-slate-200 pt-6">
        <div className="relative">
          <img 
            src={displayUser.avatar} 
            alt="Profile" 
            className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover bg-white"
          />
          {(currentUser.profile.id === displayUser.id || isAdmin) && (
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg text-slate-500 border border-slate-100 hover:text-emerald-600 transition-colors"
            >
              <Edit3 size={16} />
            </button>
          )}
        </div>
        <div className="flex-1 pb-4 text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-900">{displayUser.fullName}</h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-slate-500">
            <span className="flex items-center gap-1.5 text-sm font-medium"><Briefcase size={16} /> {displayUser.position}</span>
            <span className="flex items-center gap-1.5 text-sm font-medium"><MapPin size={16} /> {displayUser.address}</span>
            <Badge type="info">{displayUser.department}</Badge>
          </div>
        </div>
        <div className="pb-4 flex gap-3">
          {(currentUser.profile.id === displayUser.id || isAdmin) && (
            <Button className="gap-2" onClick={() => setIsEditing(true)}>
              <Edit3 size={18} /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User size={18} className="text-emerald-600" /> Personal Info
            </h3>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-semibold text-slate-900">{displayUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Phone size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
                  <p className="text-sm font-semibold text-slate-900">{displayUser.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Shield size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Role</p>
                  <p className="text-sm font-semibold text-slate-900">{displayUser.role}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
             <h3 className="font-bold text-slate-900 mb-4">Integrations</h3>
             <div className="flex gap-4">
                <Linkedin size={20} className="text-slate-300 hover:text-blue-600 cursor-pointer" />
                <Twitter size={20} className="text-slate-300 hover:text-sky-500 cursor-pointer" />
                <Globe size={20} className="text-slate-300 hover:text-emerald-600 cursor-pointer" />
             </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-xl text-slate-900">Employment Information</h3>
              <Badge type="neutral">Full Time</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Department</p>
                  <p className="text-base font-semibold text-slate-900">{displayUser.department}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Employee ID</p>
                  <p className="text-base font-semibold text-slate-900">{displayUser.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Direct Manager</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                      {getManagerInitials(managerName)}
                    </div>
                    <p className="text-base font-semibold text-slate-900">{managerName}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Join Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-slate-400" />
                    <p className="text-base font-semibold text-slate-900">{displayUser.joinDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Employment Status</p>
                  <p className="text-base font-semibold text-slate-900">Active / Permanent</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Base Salary</p>
                  <p className="text-base font-semibold text-slate-900">
                    {isAdmin || displayUser.id === currentUser.profile.id ? `₹${displayUser.salary?.toLocaleString('en-IN')}` : '••••••'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-2xl p-8 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Edit Profile</h3>
                <p className="text-xs text-slate-400 mt-1">Update your professional identity and contact info.</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Input 
                  label="Profile Picture URL" 
                  value={formData.avatar} 
                  onChange={(e) => setFormData({...formData, avatar: e.target.value})} 
                  placeholder="https://..."
                />
              </div>
              <Input 
                label="Full Name" 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                disabled={!isEditable('fullName')}
                required 
              />
              <Input 
                label="Email Address" 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                disabled={!isEditable('email')}
                required 
              />
              <Input 
                label="Phone Number" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
              <Input 
                label="Address" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
              />
              <Input 
                label="Position" 
                value={formData.position} 
                disabled={!isEditable('position')} 
                onChange={(e) => setFormData({...formData, position: e.target.value})} 
              />
              <div className="flex flex-col">
                <label className="text-[13px] font-semibold text-slate-500 mb-2 ml-1">Department</label>
                <select 
                  className="px-4 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 disabled:opacity-50"
                  value={formData.department} 
                  disabled={!isEditable('department')}
                  onChange={(e) => setFormData({...formData, department: e.target.value})} 
                  required
                >
                  <option value="People Operations">People Operations</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Product Design">Product Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="IT Operations">IT Operations</option>
                  <option value="Product">Product</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              
              <div className="md:col-span-2 flex gap-3 justify-end pt-4 mt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" className="gap-2 px-10" isLoading={isSaving}>
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
