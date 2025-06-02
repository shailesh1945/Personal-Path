import React, { useState, useEffect, useCallback } from "react";
import { FaUsers, FaBookOpen, FaChartLine } from "react-icons/fa";
import axios from "axios";
import StudentManagement from "./StudentManagement";
import AssessmentManagement from "./AssessmentManagement";
import LearningPaths from "./LearningPaths";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddAssessmentModal, setShowAddAssessmentModal] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        window.location.href = "/login";
        return;
      }

      // Create axios instance with JWT token
      const instance = axios.create({
        baseURL: "http://localhost:5000/api",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Use the same instance for the requests
      const [statsResponse, overviewResponse] = await Promise.all([
        instance.get("/dashboard/stats"),
        instance.get("/dashboard/overview"),
      ]);

      setStats(statsResponse.data);
      setOverview(overviewResponse.data);
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Update the stats cards section
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total Students */}
      <div className="bg-gradient-to-br from-indigo-100 to-indigo-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
        <div className="flex items-center">
          <div className="p-4 rounded-full bg-indigo-600 bg-opacity-20">
            <FaUsers className="h-7 w-7 text-indigo-700" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-indigo-900 font-medium">
              Total Students
            </p>
            <p className="text-3xl font-bold text-indigo-800">
              {loading ? "Loading..." : stats?.totalStudents}
            </p>
          </div>
        </div>
      </div>

      {/* Active Courses */}
      <div className="bg-gradient-to-br from-teal-100 to-teal-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
        <div className="flex items-center">
          <div className="p-4 rounded-full bg-teal-600 bg-opacity-20">
            <FaBookOpen className="h-7 w-7 text-teal-700" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-teal-900 font-medium">Active Courses</p>
            <p className="text-3xl font-bold text-teal-800">
              {loading ? "Loading..." : stats?.activeCourses}
            </p>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-gradient-to-br from-rose-100 to-rose-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
        <div className="flex items-center">
          <div className="p-4 rounded-full bg-rose-600 bg-opacity-20">
            <FaChartLine className="h-7 w-7 text-rose-700" />
          </div>
          <div className="ml-4 w-full">
            <p className="text-sm text-rose-900 font-medium">Completion Rate</p>
            <div className="flex flex-col">
              <p className="text-3xl font-bold text-rose-800">
                {loading ? "Loading..." : stats?.completionRate}
              </p>
              <div className="mt-2 w-full bg-rose-100 rounded-full h-2">
                <div
                  className="bg-rose-600 rounded-full h-2 transition-all duration-500"
                  style={{
                    width: loading
                      ? "0%"
                      : stats?.completionRate.replace("%", "") + "%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-gradient-to-br from-amber-100 to-amber-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
        <div className="flex items-center">
          <div className="p-4 rounded-full bg-amber-600 bg-opacity-20">
            <FaUsers className="h-7 w-7 text-amber-700" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-amber-900 font-medium">Active Users</p>
            <p className="text-3xl font-bold text-amber-800">
              {loading ? "Loading..." : stats?.activeUsers}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-300">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo / Title */}
            <div className="flex items-center space-x-3">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18 8c-1.333 0-2.667.667-4 2-1.333-1.333-2.667-2-4-2-3 0-6 2-6 6v3h20v-3c0-4-3-6-6-6z"
                />
              </svg>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                Admin Dashboard
              </h1>
            </div>

            {/* Admin Info + Logout */}
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Admin</span>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="px-4 py-2 bg-white text-red-600 font-semibold rounded-md shadow hover:bg-red-100 transition duration-300 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-600 p-4 rounded-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg animate-shake">
            <p className="text-red-700 text-sm font-semibold">{error}</p>
          </div>
        )}

        {renderStatsCards()}

        {/* Main Content Area */}
        <div className="bg-gradient-to-br from-indigo-100 via-indigo-200 to-indigo-350 rounded-lg shadow">

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {/* Overview Tab */}
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-6 text-sm font-medium transition-all duration-300 ease-in-out transform ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-105 shadow-md hover:opacity-90"
                    : "text-gray-500 hover:text-gray-700 hover:scale-105 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100"
                } rounded-lg`}
              >
                Overview
              </button>

              {/* Students Tab */}
              <button
                onClick={() => setActiveTab("students")}
                className={`py-4 px-6 text-sm font-medium transition-all duration-300 ease-in-out transform ${
                  activeTab === "students"
                    ? "bg-gradient-to-r from-green-400 to-teal-500 text-white scale-105 shadow-md hover:opacity-90"
                    : "text-gray-500 hover:text-gray-700 hover:scale-105 hover:bg-gradient-to-r hover:from-green-100 hover:to-teal-100"
                } rounded-lg`}
              >
                Students
              </button>

              {/* Assessments Tab */}
              <button
                onClick={() => setActiveTab("assessments")}
                className={`py-4 px-6 text-sm font-medium transition-all duration-300 ease-in-out transform ${
                  activeTab === "assessments"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105 shadow-md hover:opacity-90"
                    : "text-gray-500 hover:text-gray-700 hover:scale-105 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                } rounded-lg`}
              >
                Assessments
              </button>

              {/* Learning Paths Tab */}
              <button
                onClick={() => setActiveTab("paths")}
                className={`py-4 px-6 text-sm font-medium transition-all duration-300 ease-in-out transform ${
                  activeTab === "paths"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white scale-105 shadow-md hover:opacity-90"
                    : "text-gray-500 hover:text-gray-700 hover:scale-105 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100"
                } rounded-lg`}
              >
                Learning Paths
              </button>

              {/* Settings Tab - Uncomment when needed */}
              {/* <button
      onClick={() => setActiveTab("settings")}
      className={`py-4 px-6 text-sm font-medium transition-all duration-300 ease-in-out transform ${
        activeTab === "settings"
          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white scale-105 shadow-md hover:opacity-90"
          : "text-gray-500 hover:text-gray-700 hover:scale-105 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100"
      } rounded-lg`}
    >
      Settings
    </button> */}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Assessment Overview
                </h3>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Submissions */}
                  <div className="bg-gradient-to-br from-blue-100 to-blue-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <p className="text-sm text-blue-900 font-medium">
                          Total Submissions
                        </p>
                        <p className="text-3xl font-bold text-blue-800">
                          {overview?.totalSubmissions}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Average Score */}
                  <div className="bg-gradient-to-br from-green-100 to-green-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <p className="text-sm text-green-900 font-medium">
                          Average Score
                        </p>
                        <p className="text-3xl font-bold text-green-800">
                          {overview?.averageScore}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highest Score */}
                  <div className="bg-gradient-to-br from-purple-100 to-purple-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <p className="text-sm text-purple-900 font-medium">
                          Highest Score
                        </p>
                        <p className="text-3xl font-bold text-purple-800">
                          {overview?.highestScore}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lowest Score */}
                  <div className="bg-gradient-to-br from-orange-100 to-orange-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <p className="text-sm text-orange-900 font-medium">
                          Lowest Score
                        </p>
                        <p className="text-3xl font-bold text-orange-800">
                          {overview?.lowestScore}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assessment Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Assessment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Submissions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Avg. Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pass Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {overview?.assessmentStats.map((stat) => (
                        <tr
                          key={stat._id || `assessment-${stat.title}`}
                          className="hover:bg-gradient-to-r hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 hover:text-indigo-600 transform hover:scale-105"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stat.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.submissions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.averageScore}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500">
                                {stat.passRate}%
                              </span>
                              <div className="ml-4 flex-1 max-w-xs">
                                <div className="h-2 bg-gray-200 rounded-full">
                                  <div
                                    className="h-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-full transition-all duration-300"
                                    style={{ width: `${stat.passRate}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === "students" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Students Management
                </h3>
                <StudentManagement />
              </div>
            )}
            {activeTab === "assessments" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Assessment Management
                  </h3>
                  <button
                    onClick={() => setShowAddAssessmentModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-md hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-300"
                  >
                    Add New Assessment
                  </button>
                </div>
                <AssessmentManagement
                  showModal={showAddAssessmentModal}
                  setShowModal={setShowAddAssessmentModal}
                />
              </div>
            )}
            {activeTab === "paths" && (
              <div>
                <LearningPaths />
              </div>
            )}
            {activeTab === "settings" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                <p className="mt-4 text-gray-500">No settings available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
