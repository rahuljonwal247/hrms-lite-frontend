// File: src/pages/Attendance.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, Filter, X, Plus } from 'lucide-react';
import { attendanceAPI, employeeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Layout/Header';
import Navigation from '../components/Layout/Navigation';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    status: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: '',
  });

  // ✅ FIX: Wrapping loadData with useCallback prevents infinite re-render
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load attendance filtered
      const attendanceResponse = await attendanceAPI.getAll(filters);
      setAttendance(attendanceResponse.data.data || attendanceResponse.data);

      // Load employees if admin
      if (user?.role === 'admin') {
        const employeesResponse = await employeeAPI.getAll();
        setEmployees(employeesResponse.data.data || employeesResponse.data);
      }

      setError('');
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [filters, user?.role]);

  // Load on mount + whenever filters change
  useEffect(() => {
    loadData();
  }, [loadData]);


  const openModal = (type, record = null) => {
    setModalType(type);
    setSelectedRecord(record);

    if (type === 'edit' && record) {
      setFormData({
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        date: new Date(record.date).toISOString().split('T')[0],
        checkIn: record.checkIn || '',
        checkOut: record.checkOut || '',
        status: record.status,
        notes: record.notes || '',
      });
    } else if (type === 'add') {
      setFormData({
        employeeId: '',
        employeeName: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        status: 'present',
        notes: '',
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
    setFormData({
      employeeId: '',
      employeeName: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      status: 'present',
      notes: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'employeeId') {
      const employee = employees.find((emp) => emp.employeeId === value);

      setFormData((prev) => ({
        ...prev,
        employeeId: value,
        employeeName: employee ? employee.name : '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      employeeId: '',
      startDate: '',
      endDate: '',
      status: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (modalType === 'add') {
        await attendanceAPI.create(formData);
      } else if (modalType === 'edit') {
        await attendanceAPI.update(selectedRecord._id, formData);
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError(error.response?.data?.message || 'Failed to save attendance');
    }
  };

  const handleDelete = async () => {
    try {
      await attendanceAPI.delete(selectedRecord._id);
      closeModal();
      loadData();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      setError(error.response?.data?.message || 'Failed to delete attendance');
    }
  };

  // Stats
  const stats = {
    total: attendance.length,
    present: attendance.filter((a) => a.status === 'present').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    late: attendance.filter((a) => a.status === 'late').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Attendance Records</h2>
            <p className="text-gray-600 text-sm mt-1">
              {user?.role === 'admin'
                ? 'Track and manage employee attendance'
                : 'View your attendance history'}
            </p>
          </div>

          {user?.role === 'admin' && (
            <button
              onClick={() => openModal('add')}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
              <span>Mark Attendance</span>
            </button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Late</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
          </div>
        </div>

        {/* Filters */}
        {user?.role === 'admin' && (
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-800">Filters</h3>
              </div>
              <button onClick={clearFilters} className="text-indigo-700 text-sm">
                Clear Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <select
                  name="employeeId"
                  value={filters.employeeId}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 border rounded-lg">
            {error}
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full mx-auto"></div>
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {user?.role === 'admin' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.employeeName}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.checkIn || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.checkOut || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.checkIn && record.checkOut
                          ? `${(
                              (new Date(`1970-01-01T${record.checkOut}`) -
                                new Date(`1970-01-01T${record.checkIn}`)) /
                              (1000 * 60 * 60)
                            ).toFixed(2)} hrs`
                          : '-'}
                      </td>

                      <td className="px-6 py-4 text-sm capitalize text-gray-900">
                        {record.status}
                      </td>

                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 text-sm text-gray-900 space-x-3">
                          <button
                            onClick={() => openModal('edit', record)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openModal('delete', record)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Attendance;
