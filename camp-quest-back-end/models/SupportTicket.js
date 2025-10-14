// models/SupportTicket.js
import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  authorType: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'billing', 'equipment', 'general', 'complaint']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  replies: [replySchema],
  lastReplyAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;