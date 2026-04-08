import React, { useState, useEffect } from 'react';

const OTPVerification = ({ userId, purpose, onVerify, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      setIsVerifying(true);
      const success = await onVerify(otpCode);
      setIsVerifying(false);
      if (!success) {
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-input-0')?.focus();
      }
    }
  };

  const handleResend = async () => {
    if (canResend) {
      await onResend();
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">OTP Verification</h2>
      <p className="text-gray-600 text-center mb-6">
        Please enter the 6-digit OTP sent to your registered email/phone
        <br />
        <span className="text-sm text-gray-500">
          {purpose === 'registration' ? 'Verifying your account' : 'Verifying login'}
        </span>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              maxLength="1"
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isVerifying || otp.join('').length !== 6}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
        >
          {isVerifying ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="text-center">
          {!canResend ? (
            <p className="text-gray-600">
              Resend OTP in {formatTime(timeLeft)}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Resend OTP
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800 text-center">
          🔐 Security Info: OTP expires in 5 minutes. Maximum 3 attempts allowed.
          {purpose === 'login' && ' You will be automatically logged in after verification.'}
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;