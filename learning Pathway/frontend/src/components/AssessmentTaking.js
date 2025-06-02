import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock } from 'react-icons/fa';

const AssessmentTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (!assessment) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // Validate if all questions are answered
      const unansweredQuestions = assessment.questions.length - Object.keys(answers).length;
      if (!isAutoSubmit && unansweredQuestions > 0) {
        if (!window.confirm(`You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`)) {
          return;
        }
      }

      const response = await axios.post(`/api/student/assessments/${id}/submit`, {
        answers,
        timeSpent: assessment.duration * 60 - timeLeft,
        isAutoSubmit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show score before redirecting
      const score = response.data.score;
      alert(`Your score: ${score}%`);

      navigate('/student-dashboard', { 
        state: { 
          message: 'Assessment submitted successfully', 
          score,
          submissionId: response.data.details.submissionId
        }
      });
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit assessment');
    }
  }, [assessment, answers, id, navigate, timeLeft]);

  const fetchAssessment = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/student/assessments/${id}/start`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssessment(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch assessment');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  useEffect(() => {
    if (assessment) {
      setTimeLeft(assessment.duration * 60); // Convert minutes to seconds
    }
  }, [assessment]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(true); // Pass true for auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, handleSubmit]);

  const handleAnswer = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitClick = () => {
    handleSubmit(false); // Pass false for manual submit
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-10">
  <div className="max-w-4xl mx-auto px-4">
    
    {/* Header */}
    <div className="bg-gradient-to-r from-white to-green-100 rounded-2xl shadow-2xl p-8 mb-8 transition-all duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-900">{assessment?.title}</h1>
        <div className="flex items-center space-x-2 text-green-700 font-medium">
          <FaClock className="h-5 w-5 animate-pulse" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm text-green-700">
        <span>Question {currentQuestion + 1} of {assessment?.questions.length}</span>
        <span className="font-semibold">{assessment?.level}</span>
      </div>
    </div>

    {/* Question Card */}
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 hover:shadow-2xl transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-900 mb-6 leading-relaxed">
          {assessment?.questions[currentQuestion].questionText}
        </h2>
        
        <div className="space-y-4">
          {assessment?.questions[currentQuestion].options.map((option, index) => (
            <label
              key={index}
              className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                ${
                  answers[currentQuestion] === index
                    ? 'bg-blue-100 border-blue-400 text-blue-800 font-semibold'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  checked={answers[currentQuestion] === index}
                  onChange={() => handleAnswer(currentQuestion, index)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3">{option}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>

    {/* Navigation Buttons */}
    <div className="flex justify-between items-center">
      <button
        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
        disabled={currentQuestion === 0}
        className={`px-5 py-3 rounded-lg text-sm font-semibold shadow transition-all duration-300 ${
          currentQuestion === 0
            ? 'bg-gray-300 cursor-not-allowed text-gray-600'
            : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'
        }`}
      >
        Previous
      </button>

      {currentQuestion === assessment?.questions.length - 1 ? (
        <button
          onClick={handleSubmitClick}
          className="px-6 py-3 bg-green-500 text-white rounded-lg text-sm font-semibold shadow hover:bg-green-600 hover:scale-105 transition-all duration-300"
        >
          Submit Assessment
        </button>
      ) : (
        <button
          onClick={() => setCurrentQuestion(prev => Math.min(assessment.questions.length - 1, prev + 1))}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg text-sm font-semibold shadow hover:bg-blue-600 hover:scale-105 transition-all duration-300"
        >
          Next
        </button>
      )}
    </div>

  </div>
</div>

  );
};

export default AssessmentTaking; 