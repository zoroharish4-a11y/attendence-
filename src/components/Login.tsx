// src/components/Login.tsx
import React, { useState } from 'react';
import { 
  GraduationCap, 
  User, 
  Lock, 
  LogIn, 
  BookOpen, 
  Eye, 
  EyeOff, 
  Settings, 
  Mail, 
  ArrowLeft, 
  Key,
  Shield
} from 'lucide-react';
import { mockUsers, authUtils } from '../data/mockData';

import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState<'admin' | 'faculty' | 'student'>('admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [forgotPasswordData, setForgotPasswordData] = useState({ email: '' });
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'identify' | 'reset'>('identify');
  const [resetToken, setResetToken] = useState('');
  const [enteredToken, setEnteredToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  // ----- Helper Functions -----
  const checkPasswordStrength = (password: string) => {
    if (!password) return setPasswordStrength('');
    const requirements = {
      length: password.length >= minLength,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    const metCount = Object.values(requirements).filter(Boolean).length;
    const strength = ['Very Weak','Weak','Fair','Good','Strong'][metCount];
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 'Very Weak': return 'bg-red-500';
      case 'Weak': return 'bg-orange-500';
      case 'Fair': return 'bg-yellow-500';
      case 'Good': return 'bg-blue-500';
      case 'Strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  // ----- Login Submit -----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccessMessage(''); setIsLoading(true);

    if (!loginData.email || !loginData.password) {
      setError('Please enter email and password'); setIsLoading(false); return;
    }

    await new Promise(r => setTimeout(r, 800)); // simulate API delay

    const user = mockUsers.find(u => u.email === loginData.email && u.role === selectedRole);
    if (!user) { setError('Invalid email or role'); setIsLoading(false); return; }
    if (user.password !== loginData.password) { setError('Invalid password'); setIsLoading(false); return; }

    if (user.mustChangePassword) { setShowChangePassword(true); setIsLoading(false); return; }

    onLogin(user); setIsLoading(false);
  };

  // ----- Change Password -----
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) { setError('Passwords do not match'); return; }
    if (!passwordUtils.validatePassword(changePasswordData.newPassword)) {
      setError(`Password must have min ${PASSWORD_REQUIREMENTS.minLength} chars, upper, lower, number & special char`);
      return;
    }

    setIsLoading(true);
    try {
      passwordUtils.changePassword(
        mockUsers.find(u => u.email === loginData.email)!.id,
        changePasswordData.currentPassword,
        changePasswordData.newPassword
      );
      setShowChangePassword(false);
      setChangePasswordData({ currentPassword:'', newPassword:'', confirmPassword:'' });
      setSuccessMessage('Password changed successfully! Please login with new password.');
    } catch(err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally { setIsLoading(false); }
  };

  // ----- Forgot Password -----
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccessMessage('');
    if (!forgotPasswordData.email) { setError('Enter email'); return; }

    const user = mockUsers.find(u => u.email === forgotPasswordData.email);
    if (!user) { setError('No account found'); return; }

    const token = Math.random().toString(36).substring(2,8).toUpperCase();
    setResetToken(token); setForgotPasswordStep('reset'); setSuccessMessage(`Reset code sent to ${forgotPasswordData.email}`);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (enteredToken !== resetToken) { setError('Invalid reset code'); return; }
    if (newResetPassword !== confirmResetPassword) { setError('Passwords do not match'); return; }
    if (!passwordUtils.validatePassword(newResetPassword)) { setError('Password does not meet requirements'); return; }

    const user = mockUsers.find(u => u.email === forgotPasswordData.email);
    if (!user) { setError('User not found'); return; }
    user.password = newResetPassword; user.mustChangePassword=false; user.lastPasswordChange = new Date().toISOString();

    setShowForgotPassword(false); setForgotPasswordStep('identify'); setForgotPasswordData({email:''});
    setEnteredToken(''); setNewResetPassword(''); setConfirmResetPassword(''); setSuccessMessage('Password reset successfully!');
  };

  const resetForgotPasswordFlow = () => {
    setShowForgotPassword(false); setForgotPasswordStep('identify'); setForgotPasswordData({ email:'' });
    setResetToken(''); setEnteredToken(''); setNewResetPassword(''); setConfirmResetPassword(''); setError(''); setSuccessMessage('');
  };

  const handleNewPasswordChange = (value: string) => { setChangePasswordData(prev=>({...prev,newPassword:value})); checkPasswordStrength(value); };

  // ----- Render Forgot Password -----
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white text-center">
            <div className="flex justify-center mb-4"><div className="bg-white/20 p-3 rounded-full"><Key className="h-12 w-12"/></div></div>
            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
            <p className="text-blue-100">{forgotPasswordStep==='identify'?'Enter your email':'Enter reset code & new password'}</p>
          </div>
          <div className="px-8 py-6">
            {forgotPasswordStep==='identify' ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                  <input type="email" value={forgotPasswordData.email} onChange={e=>setForgotPasswordData({email:e.target.value})} className="w-full pl-10 pr-4 py-3 border rounded-lg" placeholder="Enter your email" required/>
                </div>
                {error && <div className="bg-red-50 border border-red-200 p-3 text-red-800">{error}</div>}
                {successMessage && <div className="bg-green-50 border border-green-200 p-3 text-green-800">{successMessage}</div>}
                <div className="flex space-x-3">
                  <button type="button" onClick={resetForgotPasswordFlow} className="flex-1 bg-gray-300 py-3 rounded-lg">Back</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg">Send Code</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <input type="text" value={enteredToken} onChange={e=>setEnteredToken(e.target.value.toUpperCase())} placeholder="Enter code" required maxLength={6} className="w-full border rounded-lg py-2 px-3"/>
                <input type="password" value={newResetPassword} onChange={e=>setNewResetPassword(e.target.value)} placeholder="New password" className="w-full border rounded-lg py-2 px-3"/>
                <input type="password" value={confirmResetPassword} onChange={e=>setConfirmResetPassword(e.target.value)} placeholder="Confirm password" className="w-full border rounded-lg py-2 px-3"/>
                {error && <div className="bg-red-50 border border-red-200 p-3 text-red-800">{error}</div>}
                <div className="flex space-x-3">
                  <button type="button" onClick={()=>setForgotPasswordStep('identify')} className="flex-1 bg-gray-300 py-3 rounded-lg">Back</button>
                  <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-lg">Reset</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----- Render Change Password -----
  if (showChangePassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white text-center">
            <div className="flex justify-center mb-4"><div className="bg-white/20 p-3 rounded-full"><Settings className="h-12 w-12"/></div></div>
            <h1 className="text-2xl font-bold mb-2">Change Password</h1>
            <p className="text-blue-100">Update your password for security</p>
          </div>
          <div className="px-8 py-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input type="password" value={changePasswordData.currentPassword} onChange={e=>setChangePasswordData(prev=>({...prev,currentPassword:e.target.value}))} placeholder="Current password" className="w-full border rounded-lg py-2 px-3"/>
              <input type="password" value={changePasswordData.newPassword} onChange={e=>handleNewPasswordChange(e.target.value)} placeholder="New password" className="w-full border rounded-lg py-2 px-3"/>
              <input type="password" value={changePasswordData.confirmPassword} onChange={e=>setChangePasswordData(prev=>({...prev,confirmPassword:e.target.value}))} placeholder="Confirm new password" className="w-full border rounded-lg py-2 px-3"/>
              {error && <div className="bg-red-50 border border-red-200 p-3 text-red-800">{error}</div>}
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ----- Main Login Screen -----
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white text-center">
          <div className="flex justify-center mb-4"><div className="bg-white/20 p-3 rounded-full"><GraduationCap className="h-12 w-12"/></div></div>
          <h1 className="text-2xl font-bold mb-2">College Portal</h1>
          <p className="text-blue-100">Attendance Management System</p>
        </div>
        <div className="px-8 py-6">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button type="button" onClick={()=>setSelectedRole('admin')} className={`${selectedRole==='admin'?'bg-red-600 text-white':'text-gray-600'} flex-1 py-2 rounded-md`}>Admin</button>
            <button type="button" onClick={()=>setSelectedRole('faculty')} className={`${selectedRole==='faculty'?'bg-blue-600 text-white':'text-gray-600'} flex-1 py-2 rounded-md`}>Faculty</button>
            <button type="button" onClick={()=>setSelectedRole('student')} className={`${selectedRole==='student'?'bg-green-600 text-white':'text-gray-600'} flex-1 py-2 rounded-md`}>Student</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={loginData.email} onChange={e=>setLoginData(prev=>({...prev,email:e.target.value}))} placeholder="Email" className="w-full border rounded-lg py-2 px-3" required/>
            <div className="relative">
              <input type={showPassword?'text':'password'} value={loginData.password} onChange={e=>setLoginData(prev=>({...prev,password:e.target.value}))} placeholder="Password" className="w-full border rounded-lg py-2 px-3" required/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-2">{showPassword?'Hide':'Show'}</button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 p-3 text-red-800">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg">{isLoading?'Signing in...':'Sign In'}</button>
            <button type="button" onClick={()=>setShowForgotPassword(true)} className="w-full text-blue-600 py-2">Forgot Password?</button>
          </form>
        </div>
      </div>
    </div>
  );
};
