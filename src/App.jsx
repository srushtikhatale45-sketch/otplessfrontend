import React, { useState, useEffect } from 'react';
import { authService } from './services/api';
import './index.css';

function App() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [user, setUser] = useState(null);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setStep('dashboard');
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (text, type) => setMessage({ text, type });

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length !== 10) {
      showMessage('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);
    try {
      const profile = await authService.getProfile(mobileNumber);
      
      if (profile.success && profile.user) {
        await authService.sendOTP(mobileNumber);
        showMessage('OTP sent! Check console for code', 'success');
        setStep('otp');
      } else {
        const name = prompt('Welcome! Please enter your name:');
        if (name && name.trim()) {
          const register = await authService.register(name.trim(), mobileNumber);
          if (register.success) {
            showMessage('Registration successful! OTP sent', 'success');
            setStep('otp');
          } else {
            showMessage(register.message, 'error');
          }
        }
      }
    } catch (error) {
      showMessage(error.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showMessage('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOTP(mobileNumber, otp);
      if (response.verified) {
        showMessage('Mobile verified successfully!', 'success');
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        setStep('dashboard');
      } else {
        showMessage(response.message, 'error');
      }
    } catch (error) {
      showMessage('Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    const newName = prompt('Enter new name:', user?.name);
    if (newName && newName.trim()) {
      setLoading(true);
      try {
        const response = await authService.updateProfile(user.mobileNumber, newName.trim());
        if (response.success) {
          const updatedUser = { ...user, name: newName.trim() };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          showMessage('Name updated successfully!', 'success');
        }
      } catch (error) {
        showMessage('Failed to update name', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setStep('login');
    showMessage('Logged out successfully', 'success');
  };

  // Login Screen
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-center ${
              message.type === 'error' 
                ? 'bg-red-100 border border-red-400 text-red-700' 
                : 'bg-green-100 border border-green-400 text-green-700'
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📱</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
            <p className="text-gray-500">Enter your mobile number to continue</p>
          </div>

          <form onSubmit={handleSendOTP}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Mobile Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 py-3 text-gray-500 bg-gray-50 rounded-l-lg">+91</span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full px-3 py-3 focus:outline-none rounded-r-lg"
                  maxLength="10"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Continue with OTP'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            By continuing, you agree to our Terms
          </p>
        </div>
      </div>
    );
  }

  // OTP Screen
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-center ${
              message.type === 'error' 
                ? 'bg-red-100 border border-red-400 text-red-700' 
                : 'bg-green-100 border border-green-400 text-green-700'
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</h2>
            <p className="text-gray-600">
              Enter the 6-digit code sent to <span className="font-semibold">+91 {mobileNumber}</span>
            </p>
            <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded-lg">
              🔍 Check your backend console for the OTP code
            </p>
          </div>

          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength="6"
              required
              autoFocus
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <button
            onClick={() => setStep('login')}
            className="w-full mt-4 text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📱</span>
            <h1 className="text-xl font-bold text-gray-800">OTP Verify</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-center ${
            message.type === 'error' 
              ? 'bg-red-100 border border-red-400 text-red-700' 
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-blue-100">Manage your profile and verification status</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <span className="text-3xl">👤</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
            <button 
              onClick={handleUpdateName} 
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              ✏️ Edit
            </button>
          </div>
          
          <div className="space-y-3">
            <p className="text-gray-700"><strong>Name:</strong> {user?.name}</p>
            <p className="text-gray-700"><strong>Mobile Number:</strong> +91 {user?.mobileNumber}</p>
            <p className="text-gray-700">
              <strong>Verification Status:</strong> 
              {user?.isVerified ? ' ✅ Verified' : ' ❌ Not Verified'}
            </p>
          </div>
        </div>

        {!user?.isVerified && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
            <p className="text-yellow-700">⚠️ Your mobile number is not verified yet. Please complete the OTP verification process.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;