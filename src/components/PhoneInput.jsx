import React, { useState } from 'react';

const PhoneInput = ({ onSubmit, isLoading }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const validatePhoneNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }
    setError('');
    onSubmit(phoneNumber.replace(/\D/g, ''));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your mobile number"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isLoading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending OTP...
            </div>
          ) : (
            'Send OTP'
          )}
        </button>
      </form>
    </div>
  );
};

export default PhoneInput;