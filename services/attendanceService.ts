
/**
 * ATTENDANCE SERVICE - ENTERPRISE BACKEND LOGIC
 * Aggregates multi-session data into daily records for HR visibility.
 */

const STORAGE_KEY = 'aligna_attendance_db';
const SEEDED_FLAG = 'aligna_attendance_seeded_v2';

// Thresholds for classification (in milliseconds)
const FULL_DAY_MS = 8 * 60 * 60 * 1000; // 8 Hours

interface LocalSession {
  checkIn: string; // ISO string
  checkOut: string | null; // ISO string or null
}

interface LocalAttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  sessions: LocalSession[];
  status: 'Present' | 'Partial' | 'Absent' | 'Leave';
  lastUpdated: string; // ISO string
}

/**
 * 1. REALISTIC HISTORICAL DATA GENERATOR
 */
const generateHistoricalData = (employeeIds: string[]): LocalAttendanceRecord[] => {
  const records: LocalAttendanceRecord[] = [];
  const today = new Date();
  
  // Generate data for the last 30 days
  for (let i = 30; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    // Skip weekends for most people
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    employeeIds.forEach(empId => {
      // 10% chance of absence/leave
      const rand = Math.random();
      if (rand < 0.05) {
        records.push({
          id: `hist_${empId}_${dateStr}`,
          employeeId: empId,
          date: dateStr,
          sessions: [],
          status: 'Absent',
          lastUpdated: date.toISOString()
        });
        return;
      }
      if (rand < 0.1) {
        records.push({
          id: `hist_${empId}_${dateStr}`,
          employeeId: empId,
          date: dateStr,
          sessions: [],
          status: 'Leave',
          lastUpdated: date.toISOString()
        });
        return;
      }

      // Realistic timings: Start between 8:45 AM and 9:45 AM
      const startHour = 8;
      const startMin = 45 + Math.floor(Math.random() * 60);
      const start = new Date(date);
      start.setHours(startHour, startMin, 0);

      // End between 5:30 PM and 7:00 PM
      const endHour = 17;
      const endMin = 30 + Math.floor(Math.random() * 90);
      const end = new Date(date);
      end.setHours(endHour, endMin, 0);

      records.push({
        id: `hist_${empId}_${dateStr}`,
        employeeId: empId,
        date: dateStr,
        sessions: [{ checkIn: start.toISOString(), checkOut: end.toISOString() }],
        status: (end.getTime() - start.getTime()) >= FULL_DAY_MS ? 'Present' : 'Partial',
        lastUpdated: end.toISOString()
      });
    });
  }
  return records;
};

/**
 * 2. AGGREGATION & COMPUTATION UTILS
 */
export const calculateNetMs = (sessions: LocalSession[]): number => {
  return sessions.reduce((total, session) => {
    if (session.checkIn && session.checkOut) {
      return total + (new Date(session.checkOut).getTime() - new Date(session.checkIn).getTime());
    }
    return total;
  }, 0);
};

export const formatDuration = (ms: number): string => {
  if (ms <= 0) return "--";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

const getClassification = (netMs: number, hasSessions: boolean, currentStatus?: string): string => {
  if (currentStatus === 'Leave' || currentStatus === 'Absent') return currentStatus;
  if (!hasSessions) return 'Absent';
  if (netMs >= FULL_DAY_MS) return 'Present';
  return 'Partial';
};

const mapRecordToHRView = (r: LocalAttendanceRecord) => {
  const sortedSessions = [...r.sessions].sort((a, b) => 
    new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
  );
  
  const firstIn = sortedSessions[0]?.checkIn;
  const lastOut = sortedSessions[sortedSessions.length - 1]?.checkOut;
  const netMs = calculateNetMs(r.sessions);
  
  return {
    id: r.id,
    employeeId: r.employeeId,
    date: r.date,
    entry: firstIn ? new Date(firstIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--:--',
    exit: lastOut ? new Date(lastOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--:--',
    checkIn: firstIn ? new Date(firstIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
    checkOut: lastOut ? new Date(lastOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
    workHours: formatDuration(netMs),
    workHoursMs: netMs,
    status: getClassification(netMs, r.sessions.length > 0, r.status)
  };
};

/**
 * 3. DATABASE OPERATIONS
 */
const getDB = (): LocalAttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  const seeded = localStorage.getItem(SEEDED_FLAG);

  if (!data || !seeded) {
    const employeeIds = ['EMP-101', 'EMP-202', 'EMP-303', 'EMP-404', 'EMP-505', 'EMP-606'];
    const historical = generateHistoricalData(employeeIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historical));
    localStorage.setItem(SEEDED_FLAG, 'true');
    return historical;
  }
  return JSON.parse(data);
};

const saveDB = (data: LocalAttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('attendance_update'));
};

/**
 * 4. EXPORTED SERVICE API
 */
export const attendanceService = {
  async checkIn(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const db = getDB();
    const now = new Date().toISOString();
    let record = db.find(r => r.employeeId === employeeId && r.date === today);

    if (record) {
      if (record.sessions.some(s => s.checkOut === null)) throw new Error("Already checked in");
      record.sessions.push({ checkIn: now, checkOut: null });
      record.lastUpdated = now;
    } else {
      db.push({
        id: `att_${Date.now()}_${employeeId}`,
        employeeId,
        date: today,
        sessions: [{ checkIn: now, checkOut: null }],
        status: 'Present',
        lastUpdated: now
      });
    }
    saveDB(db);
  },

  async checkOut(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const db = getDB();
    const record = db.find(r => r.employeeId === employeeId && r.date === today);
    if (!record) throw new Error("No active shift found");

    const activeIdx = record.sessions.findIndex(s => s.checkOut === null);
    if (activeIdx === -1) throw new Error("No active session to check out");

    const now = new Date().toISOString();
    record.sessions[activeIdx].checkOut = now;
    record.lastUpdated = now;
    saveDB(db);
  },

  subscribeToAllAttendance(callback: (records: any[]) => void) {
    const handleUpdate = () => {
      const db = getDB();
      const hrRecords = db.map(mapRecordToHRView).sort((a, b) => b.date.localeCompare(a.date));
      callback(hrRecords);
    };

    window.addEventListener('attendance_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    handleUpdate();
    return () => {
      window.removeEventListener('attendance_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  },

  subscribeToUserAttendance(employeeId: string, callback: (records: any[]) => void) {
    const handleUpdate = () => {
      const db = getDB();
      const userRecords = db
        .filter(r => r.employeeId === employeeId)
        .map(mapRecordToHRView)
        .sort((a, b) => b.date.localeCompare(a.date));
      callback(userRecords);
    };

    window.addEventListener('attendance_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    handleUpdate();
    return () => {
      window.removeEventListener('attendance_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }
};
