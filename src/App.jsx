import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PhoneInput from './components/PhoneInput';
import OTPInput from './components/OTPInput';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';

// Use full backend URL
const API_BASE_URL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

const App = () => {
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [toast, setToast] = useState(null);
  const [showTestOTP, setShowTestOTP] = useState(false);
  const [testOTP, setTestOTP] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/check`, {
        withCredentials: true
      });
      if (response.data.authenticated) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        setStep('dashboard');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSendOTP = async (number) => {
    setIsLoading(true);
    try {
      console.log('Sending OTP to backend:', `${API_BASE_URL}/otp/send-otp`);
      console.log('With phone number:', number);
      
      const response = await axios.post(`${API_BASE_URL}/otp/send-otp`, {
        phoneNumber: number
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        setPhoneNumber(number);
        setStep('otp');
        showToast('OTP sent successfully!', 'success');
        
        if (response.data.devOtp) {
          setTestOTP(response.data.devOtp);
          setShowTestOTP(true);
          showToast(`Your OTP is: ${response.data.devOtp}`, 'success');
          setTimeout(() => setShowTestOTP(false), 10000);
        }
      }
    } catch (error) {
      console.error('Send OTP error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to send OTP. ';
      if (error.code === 'ERR_NETWORK') {
        errorMessage += 'Cannot connect to server. Make sure backend is running on port 5000';
      } else if (error.response?.status === 404) {
        errorMessage += 'API endpoint not found. Please check if backend routes are correct.';
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/otp/verify-otp`, {
        phoneNumber: phoneNumber,
        otpCode: otpCode,
        name: userName || 'User'
      }, {
        withCredentials: true
      });
      
      if (response.data.verified) {
        showToast('✅ Phone number verified successfully!', 'success');
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        setTimeout(() => {
          setStep('dashboard');
          setPhoneNumber('');
          setUserName('');
          setTestOTP('');
          setShowTestOTP(false);
        }, 1000);
      } else {
        showToast(response.data.message || 'Invalid OTP. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      showToast(
        error.response?.data?.message || 'Failed to verify OTP. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/otp/resend-otp`, {
        phoneNumber: phoneNumber
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        showToast('OTP resent successfully!', 'success');
        if (response.data.devOtp) {
          setTestOTP(response.data.devOtp);
          setShowTestOTP(true);
          showToast(`New OTP: ${response.data.devOtp}`, 'success');
          setTimeout(() => setShowTestOTP(false), 10000);
        }
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      showToast(
        error.response?.data?.message || 'Failed to resend OTP. Please try again.',
        'error'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true
      });
      setIsAuthenticated(false);
      setUser(null);
      setStep('phone');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to logout', 'error');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (step === 'dashboard' && isAuthenticated) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {showTestOTP && testOTP && (
        <div className="fixed top-4 left-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-lg z-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Development OTP:</strong> {testOTP}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Valid for 5 minutes only
              </p>
            </div>
            <button
              onClick={() => setShowTestOTP(false)}
              className="ml-4 text-yellow-500 hover:text-yellow-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            OTP Verification
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'phone' 
              ? 'Enter your phone number to receive OTP' 
              : 'Enter the 6-digit code sent to your phone'}
          </p>
        </div>

        {step === 'phone' ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <PhoneInput 
              onSubmit={handleSendOTP}
              isLoading={isLoading}
            />
          </>
        ) : (
          <OTPInput
            phoneNumber={phoneNumber}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            isLoading={isLoading}
            isResending={isResending}
          />
        )}

        {step === 'otp' && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                setStep('phone');
                setPhoneNumber('');
                setTestOTP('');
                setShowTestOTP(false);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
            >
              ← Change phone number
            </button>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;