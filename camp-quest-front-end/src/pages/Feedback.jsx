// pages/Feedback.jsx
import React from 'react'
import { MessageSquare, ChevronDown, Check, X } from 'lucide-react'
import './Feedback.css'

const mockFeedback = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    subject: 'Great Service Experience',
    message: 'I wanted to thank your team for the excellent service during my recent camping trip. The equipment was in perfect condition and your staff was incredibly helpful with setup instructions.',
    rating: 5,
    status: 'New',
    date: '2023-11-14',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    subject: 'Tent Rental Feedback',
    message: 'The tent was in excellent condition and easy to set up. The pickup process was smooth and convenient. Would definitely rent from you again!',
    rating: 4,
    status: 'Responded',
    date: '2023-11-13',
  },
  {
    id: 3,
    name: 'Mike Brown',
    email: 'mike.brown@example.com',
    subject: 'Suggestion for Equipment',
    message: 'The camping stove I rented worked well, but I think it would be helpful to provide more detailed instructions for first-time users. Otherwise, everything was great!',
    rating: 3,
    status: 'Pending',
    date: '2023-11-10',
  },
  {
    id: 4,
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    subject: 'Issue with Sleeping Bag',
    message: 'The sleeping bag I rented had a broken zipper which made it difficult to use. I would appreciate if someone could contact me about a partial refund.',
    rating: 2,
    status: 'Urgent',
    date: '2023-11-09',
  },
  {
    id: 5,
    name: 'David Lee',
    email: 'david.lee@example.com',
    subject: 'Excellent Hiking Equipment',
    message: 'The hiking backpack and trekking poles I rented were of excellent quality. Made my hiking trip so much more enjoyable. Will definitely recommend your service to friends!',
    rating: 5,
    status: 'Responded',
    date: '2023-11-07',
  },
]

export function Feedback() {
  return (
    <div className="feedback-page">
      <div className="page-header">
        <h1 className="page-title">Customer Feedback</h1>
        <div className="feedback-controls">
          <button className="btn btn-secondary">
            Filter by Status
            <ChevronDown size={16} />
          </button>
          <button className="btn btn-secondary">
            Sort by Date
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
      <div className="feedback-list-page">
        {mockFeedback.map((item) => (
          <div key={item.id} className="feedback-card">
            <div className="feedback-card-header">
              <div>
                <h3 className="feedback-subject">{item.subject}</h3>
                <p className="feedback-from">From: {item.name} ({item.email})</p>
              </div>
              <div className="feedback-meta">
                <div className="feedback-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < item.rating ? 'star filled' : 'star'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className={`feedback-status ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
            </div>
            <p className="feedback-content">{item.message}</p>
            <div className="feedback-footer">
              <span className="feedback-date">Received: {item.date}</span>
              <div className="feedback-actions">
                <button className="feedback-action">
                  <MessageSquare size={16} />
                  Reply
                </button>
                <button className="feedback-action resolve">
                  <Check size={16} />
                  Mark as Resolved
                </button>
                {item.status === 'Urgent' && (
                  <button className="feedback-action escalate">
                    <X size={16} />
                    Escalate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}