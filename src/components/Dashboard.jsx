import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user, onLogout }) => {
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  const handleRefreshToken = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/refresh-token', {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        alert('Token refreshed successfully!');
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      alert('Failed to refresh token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {userData?.name}!</h1>
              <p className="text-gray-600 mt-1">Your account is verified</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="text-lg font-medium text-gray-800">{userData?.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Mobile Number</label>
                <p className="text-lg font-medium text-gray-800">{userData?.mobileNumber}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Verification Status</label>
                <p className="text-lg font-medium text-green-600">✓ Verified</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Security</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  Your session is secured with JWT tokens stored in HTTP-only cookies.
                </p>
                <p className="text-xs text-blue-600">
                  Access tokens expire in 15 minutes, refresh tokens in 7 days.
                </p>
              </div>
              
              <button
                onClick={handleRefreshToken}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Manually Refresh Token'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;