// pages/Support.jsx
import React, { useState } from 'react';
import { MessageSquare, LifeBuoy, Send, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { useFormik } from 'formik';
import { feedbackSchema, supportTicketSchema } from '../utils/validationSchemas';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const Support = () => {
  const [activeTab, setActiveTab] = useState('ticket');

  return (
    <div className="min-h-screen bg-neutral-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-neutral-400 text-lg">
            Submit a support ticket or share your feedback with us
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-neutral-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === 'ticket'
                ? 'bg-lime-500 text-neutral-900'
                : 'text-neutral-300 hover:text-white'
              }`}
          >
            <LifeBuoy className="w-5 h-5 mr-2" />
            Support Ticket
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === 'feedback'
                ? 'bg-lime-500 text-neutral-900'
                : 'text-neutral-300 hover:text-white'
              }`}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Feedback
          </button>
        </div>

        {/* Content */}
        <div className="bg-neutral-800 rounded-xl border border-neutral-700">
          {activeTab === 'ticket' ? <SupportTicketForm /> : <FeedbackForm />}
        </div>
      </div>
    </div>
  );
};

// Support Ticket Form Component
const SupportTicketForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      subject: '',
      category: '',
      priority: 'medium',
      description: ''
    },
    validationSchema: supportTicketSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const response = await axios.post('/support-tickets', values);
        if (response.data.success) {
          toast.success('Support ticket created successfully!');
          resetForm();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create support ticket');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const categories = [
    { value: 'technical', label: 'Technical Issue', icon: '🔧', desc: 'App bugs, login issues, errors' },
    { value: 'billing', label: 'Billing & Payment', icon: '💳', desc: 'Payment, refunds, invoices' },
    { value: 'equipment', label: 'Equipment Related', icon: '⛺', desc: 'Gear quality, damage, missing items' },
    { value: 'general', label: 'General Inquiry', icon: '❓', desc: 'General questions and information' },
    { value: 'complaint', label: 'Complaint', icon: '⚠️', desc: 'Service complaints and issues' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-400', desc: 'General questions, non-urgent' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400', desc: 'Standard support requests' },
    { value: 'high', label: 'High', color: 'text-orange-400', desc: 'Urgent issues affecting usage' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400', desc: 'Critical issues, safety concerns' }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="p-3 bg-lime-500/10 rounded-xl mr-4">
          <LifeBuoy className="w-6 h-6 text-lime-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Create Support Ticket</h2>
          <p className="text-neutral-400">Get help with your camping equipment needs</p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-neutral-300 mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formik.values.subject}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors ${formik.touched.subject && formik.errors.subject
                ? 'border-red-500'
                : 'border-neutral-600'
              }`}
            placeholder="Brief description of your issue"
          />
          {formik.touched.subject && formik.errors.subject && (
            <p className="mt-1 text-sm text-red-400">{formik.errors.subject}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-3">Category *</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <label
                key={cat.value}
                className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-all ${formik.values.category === cat.value
                    ? 'border-lime-500 bg-lime-500/10'
                    : 'border-neutral-600 bg-neutral-700/50 hover:border-neutral-500'
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
                      <span className={`font-medium ${formik.values.category === cat.value ? 'text-lime-500' : 'text-white'
                        }`}>
                        {cat.label}
                      </span>
                      {formik.values.category === cat.value && (
                        <CheckCircle className="w-5 h-5 text-lime-500" />
                      )}
                    </div>
                    <span className="text-sm text-neutral-400">{cat.desc}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {formik.touched.category && formik.errors.category && (
            <p className="mt-1 text-sm text-red-400">{formik.errors.category}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-3">Priority *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {priorities.map((priority) => (
              <label
                key={priority.value}
                className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${formik.values.priority === priority.value
                    ? 'border-lime-500 bg-lime-500/10'
                    : 'border-neutral-600 bg-neutral-700/50 hover:border-neutral-500'
                  }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formik.values.priority === priority.value}
                  onChange={formik.handleChange}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${formik.values.priority === priority.value ? 'text-lime-500' : priority.color
                    }`}>
                    {priority.label}
                  </span>
                  {formik.values.priority === priority.value && (
                    <CheckCircle className="w-4 h-4 text-lime-500" />
                  )}
                </div>
                <span className="text-xs text-neutral-400">{priority.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors resize-none ${formik.touched.description && formik.errors.description
                ? 'border-red-500'
                : 'border-neutral-600'
              }`}
            placeholder="Please provide detailed information about your issue..."
          />
          {formik.touched.description && formik.errors.description && (
            <p className="mt-1 text-sm text-red-400">{formik.errors.description}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className="flex items-center px-8 py-3 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Send className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Creating Ticket...' : 'Create Support Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Feedback Form Component
const FeedbackForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const formik = useFormik({
    initialValues: {
      subject: '',
      category: '',
      rating: 5,
      message: '',
      isAnonymous: false
    },
    validationSchema: feedbackSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const response = await axios.post('/feedback', values);
        if (response.data.success) {
          toast.success('Feedback submitted successfully!');
          resetForm();
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="p-3 bg-lime-500/10 rounded-xl mr-4">
          <MessageSquare className="w-6 h-6 text-lime-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Share Your Feedback</h2>
          <p className="text-neutral-400">Help us improve our camping equipment service</p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-neutral-300 mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formik.values.subject}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors ${formik.touched.subject && formik.errors.subject
                ? 'border-red-500'
                : 'border-neutral-600'
              }`}
            placeholder="Brief summary of your feedback"
          />
          {formik.touched.subject && formik.errors.subject && (
            <p className="mt-1 text-sm text-red-400">{formik.errors.subject}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-3">Category *</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <label
                key={cat.value}
                className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-all ${formik.values.category === cat.value
                    ? 'border-lime-500 bg-lime-500/10'
                    : 'border-neutral-600 bg-neutral-700/50 hover:border-neutral-500'
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
                      <span className={`font-medium ${formik.values.category === cat.value ? 'text-lime-500' : 'text-white'
                        }`}>
                        {cat.label}
                      </span>
                      {formik.values.category === cat.value && (
                        <CheckCircle className="w-5 h-5 text-lime-500" />
                      )}
                    </div>
                    <span className="text-sm text-neutral-400">{cat.desc}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {formik.touched.category && formik.errors.category && (
            <p className="mt-1 text-sm text-red-400">{formik.errors.category}</p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            Overall Experience Rating *
          </label>
          <div className="bg-neutral-700/50 border border-neutral-600 rounded-lg p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => formik.setFieldValue('rating', star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-lime-500 rounded-lg"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= (hoveredStar || formik.values.rating)
                          ? 'text-lime-500 fill-current'
                          : 'text-neutral-500'
                        }`}
                    />
                  </button>
                ))}
              </div>

              {formik.values.rating > 0 && (
                <div className="text-center">
                  <p className="text-lg font-medium text-white">
                    {getRatingText(formik.values.rating)}
                  </p>
                  <p className="text-sm text-neutral-400">
                    {formik.values.rating} out of 5 stars
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">
            Your Detailed Feedback *
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors resize-none ${formik.touched.message && formik.errors.message
                ? 'border-red-500'
                : 'border-neutral-600'
              }`}
            placeholder="Share your detailed feedback about our camping equipment and service..."
          />
          {formik.touched.message && formik.errors.message && (
            <p className="mt-1 text-sm text-red-400">{formik.errors.message}</p>
          )}
        </div>

        {/* Anonymous Option */}
        <div className="bg-neutral-700/50 border border-neutral-600 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              checked={formik.values.isAnonymous}
              onChange={formik.handleChange}
              className="h-5 w-5 text-lime-500 focus:ring-lime-500 border-neutral-500 rounded bg-neutral-700"
            />
            <div className="flex-1">
              <label htmlFor="isAnonymous" className="block text-sm font-medium text-white mb-1 cursor-pointer">
                Submit as anonymous feedback
              </label>
              <p className="text-xs text-neutral-400">
                Your identity will be kept private when this option is selected
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className="flex items-center px-8 py-3 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Send className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Submitting Feedback...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Support;