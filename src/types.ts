import React, { useState } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
  name: string;
  department?: string;
  employeeId?: string;
  studentId?: string;
  semester?: number;
  course?: string;
  lastPasswordChange: string;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
}

interface UserFormProps {
  onSubmit: (user: User) => void;
  initialData?: Partial<User>;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    ...initialData,
    role: initialData.role || "student",
    isActive: initialData.isActive ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Fill required defaults for submission
    const user: User = {
      id: formData.id || `user_${Date.now()}`,
      username: formData.username || "",
      email: formData.email || "",
      password: formData.password || "",
      role: formData.role || "student",
      name: formData.name || "",
      department: formData.department,
      employeeId: formData.employeeId,
      studentId: formData.studentId,
      semester: formData.semester,
      course: formData.course,
      lastPasswordChange: formData.lastPasswordChange || new Date().toISOString(),
      mustChangePassword: formData.mustChangePassword || false,
      isActive: formData.isActive ?? true,
      createdAt: formData.createdAt || new Date().toISOString(),
    };

    onSubmit(user);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username || ""}
        onChange={handleChange}
        required
        className="border p-2 rounded w-full"
      />
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name || ""}
        onChange={handleChange}
        required
        className="border p-2 rounded w-full"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email || ""}
        onChange={handleChange}
        required
        className="border p-2 rounded w-full"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password || ""}
        onChange={handleChange}
        required
        className="border p-2 rounded w-full"
      />
      <select
        name="role"
        value={formData.role || "student"}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      >
        <option value="admin">Admin</option>
        <option value="faculty">Faculty</option>
        <option value="student">Student</option>
      </select>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive ?? true}
          onChange={handleChange}
        />
        <span>Active</span>
      </label>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Submit
      </button>
    </form>
  );
};

export default UserForm;

