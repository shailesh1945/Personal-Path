import React, { useEffect, useState, useCallback } from 'react';
import { FaCheckCircle, FaClock, FaMedal, FaYoutube, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';

const getYouTubeVideoId = (url) => {
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error);
    return null;
  }
};

const AssessmentResults = ({ submissions }) => {
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCourseModal = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const fetchSuggestedCourses = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/dashboard/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.recommendations) {
        setSuggestedCourses(response.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setSuggestedCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (submissions && submissions.length > 0) {
      fetchSuggestedCourses();
    }
  }, [fetchSuggestedCourses, submissions]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLevelBadgeStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
     <div className="space-y-8">
  {/* Assessment Results Section */}
  <div className="mt-10 bg-gradient-to-br from-white via-green-50 to-green-100 rounded-2xl shadow-2xl p-8 transition-all duration-500">
    <h2 className="text-3xl font-extrabold text-green-800 mb-8  ">Assessment History</h2>

    {submissions.length === 0 ? (
      <div className="text-center py-10 text-gray-400 text-lg">
        No assessment history available
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {submissions.map((submission) => (
          <div
            key={submission._id}
            className="bg-white hover:bg-green-100 transition-all duration-300 rounded-xl shadow-md hover:shadow-2xl p-6 transform hover:-translate-y-2"
          >
            {/* Title and Score */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 truncate pr-2">
                {submission.assessment?.title || 'Deleted Assessment'}
              </h3>
              <div className={`text-xl font-bold ${getStatusColor(submission.score)}`}>
                {submission.score}%
              </div>
            </div>

            {/* Level Badge and Field */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                getLevelBadgeStyle(submission.assessment?.level)
              }`}>
                {submission.assessment?.level || 'Unknown Level'}
              </span>
              {submission.assessment?.engineeringField && (
                <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-700 font-semibold">
                  {submission.assessment.engineeringField}
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressBarColor(submission.score)}`}
                  style={{ width: `${submission.score}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-700 font-semibold">
              <div className="flex items-center">
                <FaClock className="mr-2 h-4 w-4 text-gray-600" />
                {Math.round(submission.timeSpent / 60)}m
              </div>
              <div className="text-right">
                {submission.correctAnswers}/{submission.totalQuestions} correct
              </div>
              <div className="col-span-1">
                Attempt #{submission.attemptNumber || 1}
              </div>
              <div className="text-right col-span-1">
                {new Date(submission.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>



        {/* Learning Recommendations Section */}
<div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 transition-all duration-500">
  <h2 className="text-2xl font-bold text-blue-900 mb-8">
    Learning Recommendations
  </h2>

  {loading ? (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  ) : suggestedCourses.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {suggestedCourses.map((course, index) => (
        <div 
          key={index}
          className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
        >
          {/* Course Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900 truncate pr-2">
              {course.title}
            </h3>
            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wide ${
              course.level === 'beginner' ? 'bg-green-100 text-green-700' :
              course.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {course.level}
            </span>
          </div>

          {/* Recommendation Reason */}
          <div className="mb-4 text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
            {course.reason}
          </div>

          {/* Course Description */}
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {course.description}
          </p>

          {/* Topics */}
          {course.topics && course.topics.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {course.topics.map((topic, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Start Learning Button */}
          {course.videoResources && course.videoResources.length > 0 && (
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-gray-500">{course.duration} weeks</span>
              <button
                onClick={() => handleOpenCourseModal(course)}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
              >
                Start Learning
                <FaArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-16 text-gray-500">
      Complete assessments to get personalized learning recommendations
    </div>
  )}
</div>

{/* Course Modal */}
{isModalOpen && selectedCourse && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative overflow-hidden">
      
      {/* Close Button */}
      <button
        onClick={handleCloseModal}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl transition"
      >
        &times;
      </button>

      {/* Title */}
      <h3 className="text-2xl font-extrabold text-indigo-800 mb-3">
        {selectedCourse.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-6">
        {selectedCourse.description}
      </p>

      {/* Roadmap */}
      {selectedCourse.topics?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-indigo-600 uppercase mb-4 tracking-wide">
            Roadmap
          </h4>
          <div className="relative pl-4 border-l-4 border-indigo-400 space-y-6">
            {selectedCourse.topics.map((topic, i) => (
              <div key={i} className="relative group">
                {/* Dot */}
                <span className="absolute -left-2 top-1.5 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>

                {/* Topic Card */}
                <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800 shadow-sm hover:shadow-md transition">
                  <strong className="block mb-1">Step {i + 1}</strong>
                  {topic}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Button */}
      {selectedCourse.videoResources?.[0]?.url && (
        <a
          href={selectedCourse.videoResources[0].url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full hover:from-indigo-600 hover:to-purple-600 transition"
        >
          🚀 Start Your Learning
        </a>
      )}
    </div>
  </div>
)}



    </>
  );
};

export default AssessmentResults;