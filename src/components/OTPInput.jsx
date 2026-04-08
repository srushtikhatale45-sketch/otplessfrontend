import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ phoneNumber, onVerify, onResend, isLoading, isResending }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const pastedArray = pastedData.split('');
    const newOtp = [...otp];
    
    for (let i = 0; i < Math.min(6, pastedArray.length); i++) {
      newOtp[i] = pastedArray[i];
    }
    setOtp(newOtp);
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }
    onVerify(otpCode);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Verify Your Number</h2>
        <p className="text-gray-600 mt-2">
          We've sent a 6-digit code to <span className="font-semibold">{phoneNumber}</span>
        </p>
      </div>

      <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            disabled={isLoading}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center mb-4">{error}</p>
      )}

      <button
        onClick={handleVerify}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <div className="text-center">
        <button
          onClick={onResend}
          disabled={isResending}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 mx-auto transition-colors duration-200"
        >
          <svg className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isResending ? 'Resending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
};

export default OTPInput;