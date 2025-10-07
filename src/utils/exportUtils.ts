import { AttendanceRecord, AttendanceStats, Student } from '../types';

export class ExportUtils {
  static generateCSV(data: any[], filename: string): void {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }
  
  static generateAttendanceReport(
    records: AttendanceRecord[],
    students: Student[],
    subject?: string,
    month?: string
  ): void {
    const reportData = students.map(student => {
      let studentRecords = records.filter(r => r.studentId === student.studentId);
      
      if (subject) {
        studentRecords = studentRecords.filter(r => r.subject === subject);
      }
      
      if (month) {
        studentRecords = studentRecords.filter(r => {
          const recordMonth = new Date(r.date).getMonth() + 1;
          return recordMonth === parseInt(month);
        });
      }
      
      const total = studentRecords.length;
      const present = studentRecords.filter(r => r.status === 'present').length;
      const late = studentRecords.filter(r => r.status === 'late').length;
      const absent = studentRecords.filter(r => r.status === 'absent').length;
      const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;
      
      return {
        'Student ID': student.studentId,
        'Student Name': student.name,
        'Course': student.course,
        'Semester': student.semester,
        'Total Classes': total,
        'Present': present,
        'Late': late,
        'Absent': absent,
        'Attendance %': percentage,
        'Status': percentage >= 75 ? 'Good' : percentage >= 60 ? 'Warning' : 'Critical'
      };
    });
    
    const filename = `attendance_report_${subject || 'all_subjects'}_${month || 'all_months'}_${new Date().toISOString().split('T')[0]}`;
    this.generateCSV(reportData, filename);
  }
  
  static generateStudentReport(studentId: string, records: AttendanceRecord[]): void {
    const studentRecords = records
      .filter(r => r.studentId === studentId)
      .map(record => ({
        'Date': record.date,
        'Subject': record.subject,
        'Period': record.period,
        'Status': record.status,
        'Faculty': record.facultyName,
        'Remarks': record.remarks || ''
      }));
    
    const filename = `student_${studentId}_attendance_${new Date().toISOString().split('T')[0]}`;
    this.generateCSV(studentRecords, filename);
  }
  
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  static printAttendanceSheet(date: string, subject: string, students: Student[]): void {
    const printContent = `
      <html>
        <head>
          <title>Attendance Sheet - ${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .signature { margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>College Attendance Management System</h1>
            <h2>Attendance Sheet</h2>
          </div>
          <div class="info">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Total Students:</strong> ${students.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Present</th>
                <th>Late</th>
                <th>Absent</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${students.map((student, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${student.studentId}</td>
                  <td>${student.name}</td>
                  <td>${student.course}</td>
                  <td>☐</td>
                  <td>☐</td>
                  <td>☐</td>
                  <td></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="signature">
            <p>Faculty Signature: ___________________ Date: ___________</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }
}