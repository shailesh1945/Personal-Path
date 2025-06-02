import React, { useState, useEffect, useCallback } from "react";
import {
  FaBook,
  FaCertificate,
  FaChartLine,
  FaCalendar,
  FaClock,
  FaGraduationCap,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import AssessmentResults from "./AssessmentResults";
import { getResourceIcon, getDifficultyLabel } from "../utils/resourceIcons";
import { NavLink } from "react-router-dom";
import LearningPaths from "./LearningPaths";

const AssessmentCard = ({ assessment, submissions }) => {
  const navigate = useNavigate();
  const submission = submissions[assessment._id];

  const getStatusDisplay = () => {
    if (!submission) {
      return { text: "Not Started", color: "yellow" };
    }

    switch (submission.status) {
      case "completed":
        return {
          text: `Score: ${submission.score}%`,
          color: submission.score >= 70 ? "green" : "orange",
        };
      case "auto_submitted":
        return {
          text: `Auto-Submitted (${submission.score}%)`,
          color: "orange",
        };
      case "in_progress":
        return { text: "In Progress", color: "blue" };
      default:
        return { text: "Not Started", color: "yellow" };
    }
  };

  const handleStartAssessment = () => {
    if (submission) {
      const confirmRetake = window.confirm(
        "You have already completed this assessment. Would you like to retake it? Your previous score will be kept in history."
      );
      if (!confirmRetake) return;
    }
    navigate(`/assessment/${assessment._id}`);
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {assessment.title}
          </h3>
          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                assessment.level === "beginner"
                  ? "bg-green-100 text-green-800"
                  : assessment.level === "intermediate"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {assessment.level.charAt(0).toUpperCase() +
                assessment.level.slice(1)}
            </span>
            <span className="flex items-center">
              <FaClock className="mr-1.5 h-4 w-4 text-gray-400" />
              {assessment.duration} mins
            </span>
            <span>{assessment.questions.length} questions</span>
          </div>
        </div>
        <button
          onClick={handleStartAssessment}
          className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
            submission
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {submission ? "Retake Assessment" : "Start Assessment"}
        </button>
      </div>

      {/* Engineering Field */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Engineering Field
        </h4>
        <div className="flex items-center text-gray-600">
          <FaGraduationCap className="h-4 w-4 mr-2" />
          <span>{assessment.engineeringField}</span>
        </div>
      </div>

      {/* Assessment Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Difficulty Level</span>
          <span className="font-medium">{assessment.level}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Time Limit</span>
          <span className="font-medium">{assessment.duration} minutes</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Questions</span>
          <span className="font-medium">{assessment.questions.length}</span>
        </div>
      </div>

      {/* Status Section */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className={`font-medium text-${status.color}-600`}>
            {status.text}
          </span>
        </div>
        {submission && (
          <>
            <div className="mt-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Last Attempt</span>
                <span>
                  {new Date(submission.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time Spent</span>
                <span>{Math.round(submission.timeSpent / 60)} minutes</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-2">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    submission.score >= 70
                      ? "bg-green-500"
                      : submission.score >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${submission.score}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    completedAssessments: 0,
    averageScore: 0,
    timeSpent: 0,
  });
  const [submissions, setSubmissions] = useState({});
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const location = useLocation();

  const fetchRecommendations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/dashboard/recommendations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Recommendations response:", response.data); // Debug log

      if (response.data.success) {
        setRecommendations(response.data.recommendations);
        setWeakAreas(response.data.weakAreas || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssessments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/student/assessments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssessments(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch assessments");
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/student/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/student/submissions",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Create a map of submissions by assessment ID
      const submissionsMap = {};
      response.data.forEach((submission) => {
        // Fix: Use the assessment._id from the submission
        const assessmentId = submission.assessment._id;
        if (
          !submissionsMap[assessmentId] ||
          new Date(submission.createdAt) >
            new Date(submissionsMap[assessmentId].createdAt)
        ) {
          submissionsMap[assessmentId] = submission;
        }
      });

      console.log("Submissions map:", submissionsMap); // Debug log
      setSubmissions(submissionsMap);
      setAllSubmissions(response.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  }, []);

  const handleAssessmentComplete = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAssessments(),
        fetchStats(),
        fetchSubmissions(),
        fetchRecommendations(),
      ]);
    } catch (error) {
      console.error("Error updating dashboard:", error);
      setError("Failed to update dashboard");
    } finally {
      setLoading(false);
    }
  }, [fetchAssessments, fetchStats, fetchSubmissions, fetchRecommendations]);

  const initializeCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      // First check existing categories
      const checkResponse = await axios.get(
        "http://localhost:5000/api/dashboard/check-categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Existing categories:", checkResponse.data);

      // Initialize if needed
      const initResponse = await axios.post(
        "http://localhost:5000/api/dashboard/initialize-categories",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Initialization response:", initResponse.data);

      // Refresh recommendations using the existing fetchRecommendations function
      fetchRecommendations();
    } catch (error) {
      console.error("Error initializing categories:", error);
    }
  };

  useEffect(() => {
    if (location.state?.message) {
      // Show success message with score if available
      const message = location.state.score
        ? `${location.state.message} Score: ${location.state.score}%`
        : location.state.message;

      alert(message);

      // Clear the message from history
      window.history.replaceState({}, document.title);

      // Refresh the dashboard data
      handleAssessmentComplete();
    }
  }, [location, handleAssessmentComplete]);

  useEffect(() => {
    // Initial data fetch
    handleAssessmentComplete();
  }, [handleAssessmentComplete]);

  return (
    <div className="min-h-screen bg-gray-100">
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
          Student Dashboard
        </h1>
      </div>

      {/* User Info + Logout */}
      <div className="flex items-center space-x-4">
        <span className="text-white font-medium">
          {localStorage.getItem("userName")}
        </span>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="px-4 py-2 bg-white text-red-600 font-semibold rounded-md shadow hover:bg-red-100 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</nav>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Add this button */}
        <button
          onClick={initializeCategories}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Initialize Learning Resources
        </button>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Assessments */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 rounded-full bg-blue-600 bg-opacity-20">
                <FaBook className="h-7 w-7 text-blue-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-blue-900 font-medium">
                  Total Assessments
                </p>
                <p className="text-3xl font-bold text-blue-800">
                  {stats.totalAssessments}
                </p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-gradient-to-br from-green-100 to-green-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 rounded-full bg-green-600 bg-opacity-20">
                <FaCertificate className="h-7 w-7 text-green-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-green-900 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-800">
                  {stats.completedAssessments}
                </p>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-gradient-to-br from-purple-100 to-purple-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 rounded-full bg-purple-600 bg-opacity-20">
                <FaChartLine className="h-7 w-7 text-purple-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-purple-900 font-medium">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-purple-800">
                  {stats.averageScore}%
                </p>
              </div>
            </div>
          </div>

          {/* Time Spent */}
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 rounded-full bg-yellow-600 bg-opacity-20">
                <FaCalendar className="h-7 w-7 text-yellow-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-yellow-900 font-medium">
                  Time Spent
                </p>
                <p className="text-3xl font-bold text-yellow-800">
                  {stats.timeSpent}h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-xl shadow-xl p-8 transition-all duration-500">
          <h2 className="text-3xl font-extrabold text-blue-800 mb-8">
            Personalized Learning Recommendations
          </h2>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-blue-700 text-lg">
                Loading your recommendations...
              </p>
            </div>
          ) : recommendations.length > 0 ? (
            <>
              {weakAreas.length > 0 && (
                <div className="mb-8 bg-blue-100 border-l-4 border-blue-500 p-6 rounded-md">
                  <p className="text-base text-blue-800 font-medium">
                    Based on your assessment results, we recommend focusing on:
                    {weakAreas.map((area, index) => (
                      <span key={area.field} className="font-semibold">
                        {index > 0 ? ", " : " "}
                        {area.field} ({area.levels.join(", ")})
                      </span>
                    ))}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((resource) => (
                  <div
                    key={resource._id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
                  >
                    <div className="flex items-center mb-4">
                      {getResourceIcon(resource.type)}
                      <h3 className="ml-4 text-xl font-semibold text-gray-800">
                        {resource.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">{resource.description}</p>

                    {resource.topics && (
                      <div className="mb-4">
                        <p className="text-sm font-bold text-gray-700 mb-2">
                          Key Topics:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {resource.topics.slice(0, 3).map((topic, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                          {resource.topics.length > 3 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              +{resource.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          Difficulty:{" "}
                          <span className="font-medium">
                            {getDifficultyLabel(resource.difficulty)}
                          </span>
                        </span>
                        {resource.duration && (
                          <span className="text-xs text-gray-500">
                            Duration:{" "}
                            <span className="font-medium">
                              {resource.duration} weeks
                            </span>
                          </span>
                        )}
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-all duration-300"
                      >
                        Start Learning
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-md flex items-center space-x-4">
              <svg
                className="h-6 w-6 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-800">
                Complete some assessments to get personalized learning
                recommendations.
              </p>
            </div>
          )}
        </div>

        {/* Assessments Section */}

        <div className="bg-green-50 rounded-xl shadow-xl transition-all duration-500">
          <div className="p-8">
            <h2 className="text-3xl font-extrabold text-green-800 mb-8">
              Available Assessments
            </h2>

            {error && (
              <div className="mb-6 p-5 bg-red-100 border-l-4 border-red-600 rounded-md text-red-800 font-medium">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {assessments.map((assessment) => (
                  <div
                    key={assessment._id}
                    className="bg-green-100 hover:bg-green-200 transition-all duration-300 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-2 p-6"
                  >
                    <AssessmentCard
                      assessment={assessment}
                      submissions={submissions}
                    />
                  </div>
                ))}
                {assessments.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-500 text-lg font-medium">
                    No assessments available at the moment
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <AssessmentResults submissions={allSubmissions} />
      </div>
    </div>
  );
};

export default StudentDashboard;
