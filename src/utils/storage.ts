// Local storage utilities for data persistence
export class StorageManager {
  private static instance: StorageManager;
  
  private constructor() {}
  
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }
  
  // Generic storage methods
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
  
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }
  
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  
  // Specific data methods
  saveAttendanceRecords(records: any[]): void {
    this.setItem('attendanceRecords', records);
  }
  
  getAttendanceRecords(): any[] {
    return this.getItem('attendanceRecords') || [];
  }
  
  saveStudents(students: any[]): void {
    this.setItem('students', students);
  }
  
  getStudents(): any[] {
    return this.getItem('students') || [];
  }
  
  saveCirculars(circulars: any[]): void {
    this.setItem('circulars', circulars);
  }
  
  getCirculars(): any[] {
    return this.getItem('circulars') || [];
  }
  
  // Backup functionality
  exportData(): string {
    const data = {
      students: this.getStudents(),
      attendanceRecords: this.getAttendanceRecords(),
      circulars: this.getCirculars(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }
  
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.students) this.saveStudents(data.students);
      if (data.attendanceRecords) this.saveAttendanceRecords(data.attendanceRecords);
      if (data.circulars) this.saveCirculars(data.circulars);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}