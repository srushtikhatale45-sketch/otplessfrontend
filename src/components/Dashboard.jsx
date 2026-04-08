import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';

const Dashboard = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUserUpdate = (event) => {
      setUser(event.detail);
    };
    window.addEventListener('user:updated', handleUserUpdate);
    return () => window.removeEventListener('user:updated', handleUserUpdate);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      onLogout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">🔐 OTP Verification System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">👤 User Information</h3>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Mobile Number:</strong> {user?.mobileNumber}</p>
                <p><strong>Verified:</strong> {user?.isVerified ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">📊 Verification Status</h3>
                {user?.isVerified ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    ✓ Your mobile number is verified!
                  </div>
                ) : (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    ⚠ Please complete OTP verification to access all features.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;