
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN'
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  HALF_DAY = 'Half-day',
  LEAVE = 'Leave'
}

export enum LeaveType {
  PAID = 'Paid',
  SICK = 'Sick',
  UNPAID = 'Unpaid'
}

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum PayrollStatus {
  DRAFT = 'Draft',
  VERIFICATION = 'Verification',
  FINANCE_REVIEW = 'Finance Review',
  APPROVED = 'Approved',
  DISBURSED = 'Disbursed'
}

export interface SalaryComponent {
  label: string;
  amount: number;
  type: 'earning' | 'deduction';
}

export interface SalaryStructure {
  basic: number;
  hra: number;
  specialAllowance: number;
  pf: number;
  tds: number;
  professionalTax: number;
}

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: UserRole;
  position: string;
  department: string;
  joinDate: string;
  salary: number; // Annual CTC
  phone: string;
  address: string;
  avatar: string;
  salaryStructure?: SalaryStructure;
  managerName?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  workHours?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  managerComment?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: EmployeeProfile;
}
