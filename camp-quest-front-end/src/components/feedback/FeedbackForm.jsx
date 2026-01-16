import React, { useState } from 'react';
import { useFormik } from 'formik';
import { feedbackSchema } from '../../utils/validationSchemas';
import { Send, Star, MessageSquare, Shield, AlertCircle, Mountain } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const FeedbackForm = ({ onSuccess, existingFeedback = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const formik = useFormik({
    initialValues: {
      subject: existingFeedback?.subject || '',
      category: existingFeedback?.category || '',
      rating: existingFeedback?.rating || 5,
      message: existingFeedback?.message || '',
      isAnonymous: existingFeedback?.isAnonymous || false
    },
    validationSchema: feedbackSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        let response;
        if (existingFeedback) {
          response = await axios.put(`/feedback/${existingFeedback._id}`, values);
        } else {
          response = await axios.post('/feedback', values);
        }

        if (response.data.success) {
          toast.success(existingFeedback ? 'Feedback updated successfully!' : 'Feedback submitted successfully!');
          if (!existingFeedback) resetForm();
          onSuccess?.();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to submit feedback');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const categories = [
    { value: 'service', label: 'Service Quality', icon: '🎯', desc: 'Overall service experience' },
    { value: 'equipment', label: 'Equipment Quality', icon: '⛺', desc: 'Camping gear condition & performance' },
    { value: 'website', label: 'Website Experience', icon: '💻', desc: 'Website usability & features' },
    { value: 'staff', label: 'Staff Behavior', icon: '👥', desc: 'Customer service interactions' },
    { value: 'pricing', label: 'Pricing', icon: '💰', desc: 'Cost & value for money' },
    { value: 'suggestion', label: 'Suggestion', icon: '💡', desc: 'Ideas for improvement' }
  ];

  const getRatingText = (rating) => {
    const texts = {
      1: 'Very Dissatisfied',
      2: 'Dissatisfied',
      3: 'Neutral',
      4: 'Satisfied',
      5: 'Very Satisfied'
    };
    return texts[rating] || '';
  };

  const handleStarClick = (rating) => {
    formik.setFieldValue('rating', rating);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="p-3 bg-green-100 rounded-xl mr-4">
          <MessageSquare className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {existingFeedback ? 'Update Your Feedback' : 'Share Your CampGear Experience'}
          </h2>
          <p className="text-slate-600">
            {existingFeedback ? 'Modify your feedback details' : 'Help us improve our camping equipment service'}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-start">
          <div className="p-1 bg-green-100 rounded-lg mr-3">
            <AlertCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">Your feedback matters!</p>
            <p className="text-sm text-green-700 mt-1">
              We read every submission and use your input to enhance our camping equipment rental service.
              Thank you for helping us serve outdoor enthusiasts better.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-3">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formik.values.subject}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 ${formik.touched.subject && formik.errors.subject
                ? 'border-red-300 bg-red-50 focus:border-red-500'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-green-500'
              }`}
            placeholder="Brief summary of your feedback (e.g., Great tent quality, Website loading issue)"
          />
          {formik.touched.subject && formik.errors.subject && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.subject}
            </p>
          )}
        </div>

        {/* Category and Rating */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-3">
              Category *
            </label>
            <div className="space-y-3">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formik.values.category === cat.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={formik.values.category === cat.value}
                    onChange={formik.handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-start space-x-3 w-full">
                    <span className="text-xl">{cat.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${formik.values.category === cat.value ? 'text-green-900' : 'text-slate-900'
                          }`}>
                          {cat.label}
                        </span>
                        {formik.values.category === cat.value && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <span className={`text-sm ${formik.values.category === cat.value ? 'text-green-700' : 'text-slate-600'
                        }`}>
                        {cat.desc}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {formik.touched.category && formik.errors.category && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                {formik.errors.category}
              </p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Overall Experience Rating *
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= (hoveredStar || formik.values.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-slate-300'
                          }`}
                      />
                    </button>
                  ))}
                </div>

                {formik.values.rating > 0 && (
                  <div className="text-center">
                    <p className="text-lg font-semibold text-slate-900">
                      {getRatingText(formik.values.rating)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {formik.values.rating} out of 5 stars
                    </p>
                  </div>
                )}
              </div>
            </div>
            {formik.touched.rating && formik.errors.rating && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                {formik.errors.rating}
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-3">
            Your Detailed Feedback *
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 resize-none ${formik.touched.message && formik.errors.message
                ? 'border-red-300 bg-red-50 focus:border-red-500'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-green-500'
              }`}
            placeholder="Share your detailed feedback about our camping equipment and service:

• Equipment condition and performance
• Rental process experience
• Customer service interactions
• Website/app usability
• Suggestions for improvement
• Any issues encountered

Your detailed feedback helps us serve outdoor enthusiasts better!"
          />
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Be specific and constructive in your feedback</span>
            <span>{formik.values.message.length}/1000</span>
          </div>
          {formik.touched.message && formik.errors.message && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.message}
            </p>
          )}
        </div>

        {/* Anonymous Option */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={formik.values.isAnonymous}
                onChange={formik.handleChange}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-slate-300 rounded-md transition-colors duration-200"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="isAnonymous" className="block text-sm font-medium text-slate-900 mb-1 cursor-pointer">
                Submit as anonymous feedback
              </label>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Shield className="w-4 h-4" />
                <span>Your identity will be kept private when this option is selected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className="flex items-center px-8 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
          >
            <Send className="w-5 h-5 mr-2" />
            {isSubmitting
              ? (existingFeedback ? 'Updating Feedback...' : 'Submitting Feedback...')
              : (existingFeedback ? 'Update Feedback' : 'Submit Feedback')
            }
          </button>
        </div>
      </form>

      {/* Footer Note */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
          <Mountain className="w-4 h-4" />
          <span>Thank you for helping CampGear improve our camping equipment service</span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;