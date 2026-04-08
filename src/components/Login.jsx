import React, { useState } from 'react';
import { authService } from '../services/api';
import OTPVerification from './OTPVerification';

const Login = ({ onLoginSuccess }) => {
  const [step, setStep] = useState('login');
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: ''
  });
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    let value = e.target.value;
    // Allow only numbers for mobile number field
    if (e.target.name === 'mobileNumber') {
      value = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleRegisterChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'mobileNumber') {
      value = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setRegisterData({
      ...registerData,
      [e.target.name]: value
    });
  };

  const validateLogin = () => {
    if (!formData.mobileNumber) {
      setError('Mobile number is required');
      return false;
    }
    if (formData.mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const validateRegister = () => {
    if (!registerData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!registerData.mobileNumber) {
      setError('Mobile number is required');
      return false;
    }
    if (registerData.mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateLogin()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({
        mobileNumber: formData.mobileNumber,
        password: formData.password
      });
      
      if (response.success) {
        setUserId(response.userId);
        setStep('otp');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateRegister()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await authService.register({
        name: registerData.name.trim(),
        mobileNumber: registerData.mobileNumber,
        password: registerData.password
      });

      if (response.success) {
        setUserId(response.userId);
        setStep('otp');
        setError('');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    try {
      const deviceInfo = navigator.userAgent;
      const response = await authService.verifyOTP({
        userId,
        otpCode,
        purpose: showRegister ? 'registration' : 'login',
        deviceInfo
      });

      if (response.verified) {
        onLoginSuccess(response.user);
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      return false;
    }
  };

  const handleResendOTP = async () => {
    try {
      await authService.resendOTP({
        userId,
        purpose: showRegister ? 'registration' : 'login'
      });
      setError('OTP resent successfully!');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  if (step === 'otp') {
    return (
      <OTPVerification
        userId={userId}
        purpose={showRegister ? 'registration' : 'login'}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 py-2 text-center font-medium ${!showRegister ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setShowRegister(false)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${showRegister ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setShowRegister(true)}
          >
            Register
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!showRegister ? (
          // Login Form - Mobile Number & Password
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Mobile Number</label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-blue-500">
                <span className="px-3 text-gray-500">+91</span>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 focus:outline-none rounded-r-lg"
                  maxLength="10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Sending OTP...' : 'Login with OTP'}
            </button>
          </form>
        ) : (
          // Registration Form - Name, Mobile Number, Password
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Mobile Number</label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-blue-500">
                <span className="px-3 text-gray-500">+91</span>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={registerData.mobileNumber}
                  onChange={handleRegisterChange}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 focus:outline-none rounded-r-lg"
                  maxLength="10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number (will be used for login)</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Sending OTP...' : 'Register'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>🔐 OTP will be sent to your mobile number for verification</p>
        </div>
      </div>
    </div>
  );
};

export default Login;