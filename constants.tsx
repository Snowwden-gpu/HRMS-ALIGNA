
import { 
  UserRole, 
  AttendanceStatus, 
  LeaveType, 
  LeaveStatus, 
  EmployeeProfile, 
  AttendanceRecord, 
  LeaveRequest 
} from './types';

export const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const MOCK_EMPLOYEES: EmployeeProfile[] = [
  {
    id: '1',
    employeeId: 'EMP-101',
    fullName: 'Priya Verma',
    email: 'priya.verma@aligna.io',
    role: UserRole.ADMIN,
    position: 'HR Director',
    department: 'People Operations',
    joinDate: '2021-11-05',
    salary: 2400000, 
    phone: '+91 99887 76655',
    address: 'Vasant Vihar, New Delhi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    salaryStructure: {
      basic: 100000,
      hra: 40000,
      specialAllowance: 60000,
      pf: 12000,
      tds: 25000,
      professionalTax: 200
    },
    managerName: 'Sidharth Shukla'
  },
  {
    id: '2',
    employeeId: 'EMP-202',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@aligna.io',
    role: UserRole.EMPLOYEE,
    position: 'Lead Engineer',
    department: 'Software Engineering',
    joinDate: '2022-08-12',
    salary: 3200000, 
    phone: '+91 98765 43210',
    address: 'Indiranagar, Bangalore',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    salaryStructure: {
      basic: 133333,
      hra: 53333,
      specialAllowance: 80000,
      pf: 16000,
      tds: 35000,
      professionalTax: 200
    },
    managerName: 'Sidharth Shukla'
  },
  {
    id: '3',
    employeeId: 'EMP-303',
    fullName: 'Amit Patel',
    email: 'amit.patel@aligna.io',
    role: UserRole.EMPLOYEE,
    position: 'Senior UX Designer',
    department: 'Product Design',
    joinDate: '2023-03-20',
    salary: 1800000, 
    phone: '+91 91234 56789',
    address: 'Bandra West, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    salaryStructure: {
      basic: 75000,
      hra: 30000,
      specialAllowance: 45000,
      pf: 9000,
      tds: 12000,
      professionalTax: 200
    },
    managerName: 'Sidharth Shukla'
  },
  {
    id: '4',
    employeeId: 'EMP-404',
    fullName: 'Neha Gupta',
    email: 'neha.gupta@aligna.io',
    role: UserRole.EMPLOYEE,
    position: 'Senior Content Strategist',
    department: 'Marketing',
    joinDate: '2023-06-15',
    salary: 1200000,
    phone: '+91 92233 44556',
    address: 'Saket, New Delhi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    salaryStructure: {
      basic: 50000,
      hra: 20000,
      specialAllowance: 30000,
      pf: 6000,
      tds: 8000,
      professionalTax: 200
    },
    managerName: 'Sidharth Shukla'
  },
  {
    id: '5',
    employeeId: 'EMP-505',
    fullName: 'Suresh Kumar',
    email: 'suresh.kumar@aligna.io',
    role: UserRole.EMPLOYEE,
    position: 'Infrastructure Lead',
    department: 'IT Operations',
    joinDate: '2022-01-10',
    salary: 2800000,
    phone: '+91 93344 55667',
    address: 'HSR Layout, Bangalore',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200',
    salaryStructure: {
      basic: 116666,
      hra: 46666,
      specialAllowance: 70000,
      pf: 14000,
      tds: 28000,
      professionalTax: 200
    },
    managerName: 'Sidharth Shukla'
  },
  {
    id: '6',
    employeeId: 'EMP-606',
    fullName: 'Anjali Mehta',
    email: 'anjali.mehta@aligna.io',
    role: UserRole.EMPLOYEE,
    position: 'Product Manager',
    department: 'Product',
    joinDate: '2023-09-01',
    salary: 2200000,
    phone: '+91 94455 66778',
    address: 'Powai, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    salaryStructure: {
      basic: 91666,
      hra: 36666,
      specialAllowance: 55000,
      pf: 11000,
      tds: 22000,
      professionalTax: 200
    },
    managerName: 'Sidharth Shukla'
  }
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-202', employeeId: 'EMP-202', date: '2024-05-15', checkIn: '09:05 AM', checkOut: '06:15 PM', status: AttendanceStatus.PRESENT, workHours: '9h 10m' },
  { id: 'att-303', employeeId: 'EMP-303', date: '2024-05-15', checkIn: '09:15 AM', checkOut: '05:45 PM', status: AttendanceStatus.PRESENT, workHours: '8h 30m' },
  { id: 'att-404', employeeId: 'EMP-404', date: '2024-05-15', checkIn: '09:30 AM', checkOut: '06:00 PM', status: AttendanceStatus.PRESENT, workHours: '8h 30m' },
  { id: 'att-505', employeeId: 'EMP-505', date: '2024-05-15', checkIn: '09:00 AM', checkOut: '01:30 PM', status: 'Partial' as any, workHours: '4h 30m' },
  { id: 'att-606', employeeId: 'EMP-606', date: '2024-05-15', checkIn: '09:10 AM', checkOut: '06:20 PM', status: AttendanceStatus.PRESENT, workHours: '9h 10m' },
];

export const MOCK_LEAVES: LeaveRequest[] = [
  {
    id: 'l1',
    employeeId: 'EMP-202',
    employeeName: 'Rahul Sharma',
    type: LeaveType.SICK,
    startDate: '2024-05-20',
    endDate: '2024-05-21',
    reason: 'Suffering from seasonal flu',
    status: LeaveStatus.PENDING,
    appliedDate: '2024-05-18'
  }
];
