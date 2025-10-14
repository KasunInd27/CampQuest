// pages/Dashboard.jsx
import React from 'react';
import './Dashboard.css';

export function Dashboard({ user }) {
  
  const stats = [
    {
      name: 'Active Rentals',
      value: 5,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Equipment Items',
      value: 124,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
      change: '+3%',
      changeType: 'positive',
    },
    {
      name: 'Registered Users',
      value: 843,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      change: '+18%',
      changeType: 'positive',
    },
    {
      name: 'Support Tickets',
      value: 12,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      change: '-5%',
      changeType: 'negative',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Password changed',
      timestamp: '2 hours ago',
      ip: '192.168.1.1',
      location: 'New York, USA',
    },
    {
      id: 2,
      action: 'Login successful',
      timestamp: '1 day ago',
      ip: '192.168.1.1',
      location: 'New York, USA',
    },
    {
      id: 3,
      action: 'Profile updated',
      timestamp: '3 days ago',
      ip: '192.168.1.1',
      location: 'New York, USA',
    },
    {
      id: 4,
      action: 'Login successful',
      timestamp: '5 days ago',
      ip: '192.168.1.1',
      location: 'New York, USA',
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's what's happening with your Camp Quest account today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.name} className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <p>{stat.name}</p>
                <h2 className="stat-value">{stat.value}</h2>
              </div>
              <div className="stat-icon">{stat.icon}</div>
            </div>
            <div className={`stat-change ${stat.changeType}`}>
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Activity</h2>
            <p>Your account security events from the past week</p>
          </div>
          <div className="card-content">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Time</th>
                  <th className="hidden-mobile">IP Address</th>
                  <th className="hidden-mobile">Location</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.action}</td>
                    <td>{activity.timestamp}</td>
                    <td className="hidden-mobile">{activity.ip}</td>
                    <td className="hidden-mobile">{activity.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <a href="/security" className="view-all-link">
                View all activity
              </a>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div>
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-header-with-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <h2>Security Tips</h2>
              </div>
            </div>
            <div className="security-tips">
              <ul className="tips-list">
                <li className="tip-item">
                  <div className="tip-status success">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3l8-8"></path>
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.51 0 2.93.37 4.18 1.03"></path>
                    </svg>
                  </div>
                  <div className="tip-content">
                    <p className="tip-title">Strong password</p>
                    <p className="tip-description">
                      Your password meets our security requirements.
                    </p>
                  </div>
                </li>
                <li className="tip-item">
                  <div className="tip-status warning">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div className="tip-content">
                    <p className="tip-title">Two-factor authentication</p>
                    <p className="tip-description">
                      Enable 2FA for enhanced account security.
                    </p>
                  </div>
                </li>
                <li className="tip-item">
                  <div className="tip-status danger">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div className="tip-content">
                    <p className="tip-title">Recent logins</p>
                    <p className="tip-description">
                      Check your recent login activity regularly.
                    </p>
                  </div>
                </li>
              </ul>
              <button className="security-button">
                Security Settings
              </button>
            </div>
          </div>

          {/* Camp Quest Premium */}
          <div className="dashboard-card premium-card">
            <div className="premium-bg">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3.5 21 14 3l10.5 18H3.5Z"></path>
                <path d="M12 13.5 7.5 21"></path>
                <path d="M16.5 21 12 13.5"></path>
              </svg>
            </div>
            <div className="premium-content">
              <h3 className="premium-title">Camp Quest Premium</h3>
              <p className="premium-description">
                Upgrade to premium for exclusive camping gear and priority bookings!
              </p>
              <button className="premium-button">
                Explore Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}