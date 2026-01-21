import React, { useState, useEffect, useCallback } from 'react';
import { Users, Check, X } from 'lucide-react';
import { employeeAPI, attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Layout/Header';
import Navigation from '../components/Layout/Navigation';

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      if (user?.role === 'admin') {
        const today = new Date().toISOString().split('T')[0];

        const [employeesRes, attendanceRes] = await Promise.all([
          employeeAPI.getAll(),
          attendanceAPI.getAll({ date: today }),
        ]);

        const employees = employeesRes.data.data || employeesRes.data;
        const attendance = attendanceRes.data.data || attendanceRes.data;

        setStats({
          totalEmployees: employees.length,
          presentToday: attendance.filter(
            (a) => a.status === 'present'
          ).length,
          absentToday: attendance.filter(
            (a) => a.status === 'absent'
          ).length,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome, {user?.name}!
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : user?.role === 'admin' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total Employees
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.totalEmployees}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Present Today
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.presentToday}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Check className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Absent Today
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.absentToday}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <X className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
            <Users
              size={48}
              className="mx-auto text-indigo-600 mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Employee Dashboard
            </h3>
            <p className="text-gray-600">
              View your attendance records and personal information
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
