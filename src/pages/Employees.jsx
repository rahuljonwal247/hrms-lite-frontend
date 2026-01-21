// File: src/pages/Employees.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import { employeeAPI } from "../services/api";
import Header from "../components/Layout/Header";
import Navigation from "../components/Layout/Navigation";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'add', 'edit', 'delete'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    department: "",
    position: "",
    phone: "",
    address: "",
    salary: "",
    status: "active",
  });

  // ----------------------------------------------------
  // 🚀 LOAD EMPLOYEES — wrapped in useCallback
  // ----------------------------------------------------
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await employeeAPI.getAll();
      setEmployees(res.data.data || res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // ----------------------------------------------------
  // 🚀 OPEN MODAL HANDLER
  // ----------------------------------------------------
  const openModal = (type, employee = null) => {
    setModalType(type);
    setSelectedEmployee(employee);

    if (type === "edit" && employee) {
      setFormData({
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        phone: employee.phone || "",
        address: employee.address || "",
        salary: employee.salary || "",
        status: employee.status || "active",
      });
    } else {
      setFormData({
        employeeId: "",
        name: "",
        email: "",
        department: "",
        position: "",
        phone: "",
        address: "",
        salary: "",
        status: "active",
      });
    }

    setShowModal(true);
  };

  // ----------------------------------------------------
  // 🚀 CLOSE MODAL
  // ----------------------------------------------------
  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    setError("");
  };

  // ----------------------------------------------------
  // 🚀 HANDLE INPUT CHANGE
  // ----------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ----------------------------------------------------
  // 🚀 SUBMIT (ADD/EDIT)
  // ----------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (modalType === "add") {
        await employeeAPI.create(formData);
      } else if (modalType === "edit") {
        await employeeAPI.update(selectedEmployee._id, formData);
      }

      closeModal();
      loadEmployees();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save employee");
    }
  };

  // ----------------------------------------------------
  // 🚀 DELETE EMPLOYEE
  // ----------------------------------------------------
  const handleDelete = async () => {
    try {
      await employeeAPI.delete(selectedEmployee._id);
      closeModal();
      loadEmployees();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete employee");
    }
  };

  // ----------------------------------------------------
  // 🚀 SEARCH FILTER
  // ----------------------------------------------------
  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term)
    );
  });

  // ----------------------------------------------------
  // 🚀 RENDER
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage your organization's employees
            </p>
          </div>

          <button
            onClick={() => openModal("add")}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            <span>Add Employee</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, ID, department, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No employees found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Dept</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{emp.employeeId}</td>
                      <td className="px-6 py-4 text-sm">{emp.name}</td>
                      <td className="px-6 py-4 text-sm">{emp.email}</td>
                      <td className="px-6 py-4 text-sm">{emp.department}</td>
                      <td className="px-6 py-4 text-sm">{emp.position}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            emp.status === "active"
                              ? "bg-green-100 text-green-800"
                              : emp.status === "inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal("edit", emp)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openModal("delete", emp)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Count */}
        {!loading && (
          <p className="mt-4 text-sm text-gray-600">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {modalType === "add" && "Add Employee"}
                {modalType === "edit" && "Edit Employee"}
                {modalType === "delete" && "Delete Employee"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Delete Modal */}
            {modalType === "delete" ? (
              <>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete{" "}
                  <strong>{selectedEmployee?.name}</strong>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Employee ID *</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      required
                      disabled={modalType === "edit"}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Position *</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Salary</label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {modalType === "add" ? "Add Employee" : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
