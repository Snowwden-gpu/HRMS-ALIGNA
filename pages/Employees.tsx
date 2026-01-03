
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input } from '../components/UI';
import { Search, Filter, Plus, Mail, MoreHorizontal, UserCheck, Shield, X, Save, Trash2 } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../constants';
import { UserRole, EmployeeProfile } from '../types';

export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeProfile[]>(MOCK_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    position: '',
    department: '',
    role: UserRole.EMPLOYEE,
    joinDate: new Date().toISOString().split('T')[0],
    salary: 0,
    phone: '',
    address: ''
  });

  // Derived filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = filterDept === '' || emp.department === filterDept;
      const matchesRole = filterRole === '' || emp.role === filterRole;

      return matchesSearch && matchesDept && matchesRole;
    });
  }, [employees, searchTerm, filterDept, filterRole]);

  const departments = Array.from(new Set(employees.map(e => e.department)));
  const roles = [UserRole.ADMIN, UserRole.EMPLOYEE];

  const handleOpenAddModal = () => {
    setFormData({
      fullName: '',
      email: '',
      position: '',
      department: '',
      role: UserRole.EMPLOYEE,
      joinDate: new Date().toISOString().split('T')[0],
      salary: 0,
      phone: '',
      address: ''
    });
    setShowAddModal(true);
  };

  const handleOpenManageModal = (employee: EmployeeProfile) => {
    setSelectedEmployee(employee);
    setFormData({
      fullName: employee.fullName,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      role: employee.role,
      joinDate: employee.joinDate,
      salary: employee.salary,
      phone: employee.phone,
      address: employee.address
    });
    setShowManageModal(true);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = (employees.length + 1).toString();
    const newEmp: EmployeeProfile = {
      ...formData,
      id: newId,
      employeeId: `EMP-${100 + employees.length + 1}`,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + employees.length}?auto=format&fit=crop&q=80&w=200`,
    };
    setEmployees([newEmp, ...employees]);
    setShowAddModal(false);
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    const updated = employees.map(emp => 
      emp.id === selectedEmployee.id ? { ...emp, ...formData } : emp
    );
    setEmployees(updated);
    setShowManageModal(false);
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
      setShowManageModal(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Employee Directory</h2>
          <p className="text-slate-500 text-sm">Manage company staff and organizational hierarchy.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-emerald-100" onClick={handleOpenAddModal}>
          <Plus size={18} /> Add New Employee
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm"
            placeholder="Search by name, role, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Button 
            variant="outline" 
            className={`gap-2 py-2.5 ${showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} /> Filters
          </Button>
          
          {showFilters && (
            <div className="absolute right-0 mt-2 w-64 p-4 bg-white border border-slate-100 rounded-2xl shadow-premium z-20 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Department</label>
                <select 
                  className="w-full text-sm p-2 bg-slate-50 rounded-lg focus:outline-none"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Role</label>
                <select 
                  className="w-full text-sm p-2 bg-slate-50 rounded-lg focus:outline-none"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-rose-500 hover:bg-rose-50"
                onClick={() => { setFilterDept(''); setFilterRole(''); }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => (
          <Card key={employee.id} className="group hover:border-emerald-200 hover:shadow-md transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <img src={employee.avatar} alt={employee.fullName} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50" />
                <button 
                  className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => handleOpenManageModal(employee)}
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{employee.fullName}</h3>
                <p className="text-sm text-slate-500 font-medium">{employee.position}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge type="neutral">{employee.department}</Badge>
                {employee.role === UserRole.ADMIN && <Badge type="info"><Shield size={10} className="mr-1" /> HR Admin</Badge>}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <UserCheck size={16} className="text-slate-400" />
                  <span>Joined {employee.joinDate}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 bg-white hover:bg-white text-slate-700 border border-slate-200"
                onClick={() => navigate(`/profile/${employee.id}`)}
              >
                View Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white"
                onClick={() => handleOpenManageModal(employee)}
              >
                Manage
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-2xl p-8 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="grid grid-cols-2 gap-4">
               <Input label="Full Name" placeholder="e.g. John Doe" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
               <Input label="Email Address" type="email" placeholder="john@company.io" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
               <Input label="Position" placeholder="e.g. Software Engineer" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} required />
               <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-slate-500 mb-2 ml-1">Department</label>
                  <select className="px-4 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} required>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
               </div>
               <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-slate-500 mb-2 ml-1">Role</label>
                  <select className="px-4 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value={UserRole.EMPLOYEE}>Employee</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
               </div>
               <Input label="Join Date" type="date" value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} required />
               <Input label="Phone Number" placeholder="+91 00000 00000" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
               <Input label="Annual Salary (INR)" type="number" value={formData.salary} onChange={(e) => setFormData({...formData, salary: parseInt(e.target.value)})} />
               <div className="col-span-2">
                 <Input label="Address" placeholder="e.g. Bangalore, India" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
               </div>
               <div className="col-span-2 flex gap-3 justify-end pt-4">
                 <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                 <Button type="submit" className="gap-2 px-8">
                   <Save size={16} /> Save Employee
                 </Button>
               </div>
            </form>
          </Card>
        </div>
      )}

      {/* Manage Employee Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-2xl p-8 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Manage Employee: {selectedEmployee?.fullName}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDeleteEmployee(selectedEmployee!.id)} 
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove Employee"
                >
                  <Trash2 size={20} />
                </button>
                <button onClick={() => setShowManageModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdateEmployee} className="grid grid-cols-2 gap-4">
               <Input label="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
               <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
               <Input label="Position" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} required />
               <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-slate-500 mb-2 ml-1">Department</label>
                  <select className="px-4 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} required>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
               </div>
               <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-slate-500 mb-2 ml-1">Role</label>
                  <select className="px-4 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value={UserRole.EMPLOYEE}>Employee</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
               </div>
               <Input label="Join Date" type="date" value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} required />
               <Input label="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
               <Input label="Annual Salary (INR)" type="number" value={formData.salary} onChange={(e) => setFormData({...formData, salary: parseInt(e.target.value)})} />
               <div className="col-span-2 flex gap-3 justify-end pt-4">
                 <Button type="button" variant="ghost" onClick={() => setShowManageModal(false)}>Cancel</Button>
                 <Button type="submit" className="gap-2 px-8">
                   <Save size={16} /> Update Details
                 </Button>
               </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
