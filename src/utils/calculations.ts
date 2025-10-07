import { AttendanceRecord, AttendanceStats } from '../types';

export class AttendanceCalculator {
  static calculateStudentStats(
    studentId: string,
    records: AttendanceRecord[],
    subject?: string,
    month?: string,
    year?: number
  ): AttendanceStats | null {
    let filteredRecords = records.filter(record => record.studentId === studentId);
    
    if (subject) {
      filteredRecords = filteredRecords.filter(record => record.subject === subject);
    }
    
    if (month && year) {
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === parseInt(month) - 1 && recordDate.getFullYear() === year;
      });
    }
    
    if (filteredRecords.length === 0) return null;
    
    const totalClasses = filteredRecords.length;
    const presentClasses = filteredRecords.filter(r => r.status === 'present').length;
    const lateClasses = filteredRecords.filter(r => r.status === 'late').length;
    const absentClasses = filteredRecords.filter(r => r.status === 'absent').length;
    
    // Count late as half present for percentage calculation
    const effectivePresent = presentClasses + (lateClasses * 0.5);
    const percentage = Math.round((effectivePresent / totalClasses) * 100);
    
    return {
      studentId,
      studentName: filteredRecords[0].studentName,
      totalClasses,
      presentClasses,
      absentClasses,
      lateClasses,
      percentage,
      subject: subject || 'All Subjects',
      month: month || 'All Months',
      year: year || new Date().getFullYear()
    };
  }
  
  static calculateClassAverage(records: AttendanceRecord[], subject?: string): number {
    const studentIds = [...new Set(records.map(r => r.studentId))];
    const studentStats = studentIds.map(id => 
      this.calculateStudentStats(id, records, subject)
    ).filter(stat => stat !== null);
    
    if (studentStats.length === 0) return 0;
    
    const totalPercentage = studentStats.reduce((sum, stat) => sum + stat!.percentage, 0);
    return Math.round(totalPercentage / studentStats.length);
  }
  
  static getAttendanceThresholdAlerts(
    records: AttendanceRecord[],
    threshold: number = 75
  ): AttendanceStats[] {
    const studentIds = [...new Set(records.map(r => r.studentId))];
    const alerts: AttendanceStats[] = [];
    
    studentIds.forEach(studentId => {
      const stats = this.calculateStudentStats(studentId, records);
      if (stats && stats.percentage < threshold) {
        alerts.push(stats);
      }
    });
    
    return alerts.sort((a, b) => a.percentage - b.percentage);
  }
  
  static getMonthlyTrends(records: AttendanceRecord[], studentId: string): any[] {
    const monthlyData: { [key: string]: any } = {};
    
    records
      .filter(r => r.studentId === studentId)
      .forEach(record => {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            total: 0,
            present: 0,
            late: 0,
            absent: 0
          };
        }
        
        monthlyData[monthKey].total++;
        monthlyData[monthKey][record.status]++;
      });
    
    return Object.values(monthlyData).map((data: any) => ({
      ...data,
      percentage: Math.round(((data.present + data.late * 0.5) / data.total) * 100)
    }));
  }
}