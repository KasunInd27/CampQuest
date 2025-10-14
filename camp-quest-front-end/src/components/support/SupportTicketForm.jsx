

import React, { useState } from 'react';
import { useFormik } from 'formik';
import { supportTicketSchema } from '../../utils/validationSchemas';
import { Send, Upload, X, FileText, AlertCircle, Ticket, Mountain } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SupportTicketForm = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [dragActive, setDragActive] = useState(false);

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
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          formData.append(key, values[key]);
        });
        
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
console.log('Submitting form with data:', formData);
        const response = await axios.post('http://localhost:5000/api/support-tickets', values);

        if (response.data.success) {
          toast.success('Support ticket created successfully!');
          resetForm();
          setAttachments([]);
          onSuccess?.();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create support ticket');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const categories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payment' },
    { value: 'equipment', label: 'Equipment Related' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'complaint', label: 'Complaint' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-slate-600', desc: 'General questions, non-urgent issues' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600', desc: 'Standard support requests' },
    { value: 'high', label: 'High', color: 'text-orange-600', desc: 'Urgent issues affecting usage' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600', desc: 'Critical issues, safety concerns' }
  ];

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="p-3 bg-green-100 rounded-xl mr-4">
          <Ticket className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create Support Ticket</h2>
          <p className="text-slate-600">Get help with your camping equipment needs</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-start">
          <div className="p-1 bg-green-100 rounded-lg mr-3">
            <AlertCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">Before creating a ticket</p>
            <p className="text-sm text-green-700 mt-1">
              Please provide detailed information including equipment model numbers, rental dates, 
              and any error messages to help us resolve your issue quickly.
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
            className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 ${
              formik.touched.subject && formik.errors.subject
                ? 'border-red-300 bg-red-50 focus:border-red-500'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-green-500'
            }`}
            placeholder="Brief description of your issue (e.g., Damaged tent rental #12345)"
          />
          {formik.touched.subject && formik.errors.subject && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.subject}
            </p>
          )}
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-3">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 ${
                formik.touched.category && formik.errors.category
                  ? 'border-red-300 bg-red-50 focus:border-red-500'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-green-500'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {formik.touched.category && formik.errors.category && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                {formik.errors.category}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Priority Level *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {priorities.map((priority) => (
                <label
                  key={priority.value}
                  className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formik.values.priority === priority.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
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
                    <span className={`font-semibold ${
                      formik.values.priority === priority.value ? 'text-green-900' : priority.color
                    }`}>
                      {priority.label}
                    </span>
                    {formik.values.priority === priority.value && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-xs ${
                    formik.values.priority === priority.value ? 'text-green-700' : 'text-slate-500'
                  }`}>
                    {priority.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-3">
            Detailed Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 ${
              formik.touched.description && formik.errors.description
                ? 'border-red-300 bg-red-50 focus:border-red-500'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-green-500'
            }`}
            placeholder="Please provide detailed information about your issue:
• Equipment details (model, rental dates, condition)
• Steps to reproduce the problem
• Error messages or screenshots
• When the issue occurred
• Any other relevant information"
          />
          {formik.touched.description && formik.errors.description && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.description}
            </p>
          )}
        </div>


        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className="flex items-center px-8 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
          >
            <Send className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Creating Ticket...' : 'Create Support Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupportTicketForm;