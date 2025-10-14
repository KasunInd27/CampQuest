// pages/UserDashboard.jsx
import React, { useState } from 'react'
import { User, Lock, Trash2, Save, AlertTriangle, Mail, Phone, MapPin, FileText, Calendar, Shield, Settings, Activity, Ticket, MessageSquare, Mountain, Edit, Key, UserX, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Orders from '../components/Orders'
import UserSupport from './UserSupport'

const UserDashboard = () => {
  const { user, checkAuth } = useAuth()
  const [activeSection, setActiveSection] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Validation Schemas
  const profileValidationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format')
      .min(10, 'Phone number must be at least 10 digits')
      .nullable()
      .transform((value, originalValue) => originalValue?.trim() === '' ? null : value),
    address: Yup.string()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address must not exceed 200 characters')
      .nullable()
      .transform((value, originalValue) => originalValue?.trim() === '' ? null : value),
    bio: Yup.string()
      .max(500, 'Bio must not exceed 500 characters')
      .nullable()
      .transform((value, originalValue) => originalValue?.trim() === '' ? null : value)
  })

  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Current password is required'),
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must not exceed 50 characters')
      .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password')
      .matches(/^(?=.*[a-zA-Z])/, 'Password must contain at least one letter')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your new password')
  })

  // Profile Form
  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || ''
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setLoading(true)
        const { data } = await axios.put('/users/profile', values)
        if (data.success) {
          toast.success('Profile updated successfully')
          checkAuth()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update profile')
      } finally {
        setLoading(false)
        setSubmitting(false)
      }
    }
  })

  // Password Form
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setLoading(true)
        const { data } = await axios.put('/users/password', {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
        if (data.success) {
          toast.success('Password updated successfully')
          resetForm()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update password')
      } finally {
        setLoading(false)
        setSubmitting(false)
      }
    }
  })

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      const { data } = await axios.delete('/users/account')
      if (data.success) {
        toast.success('Account deleted successfully')
        window.location.href = '/'
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Activity },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'profile', label: 'Profile Settings', icon: Edit },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'danger', label: 'Account Settings', icon: UserX }
  ]

  return (
    <div className="min-h-screen bg-neutral-800">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-neutral-900 min-h-screen p-6">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">CampGear</h1>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-lime-500 text-black'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}!</h1>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                  title="Profile Completion"
                  value="85%"
                  icon={<User className="text-blue-400" />}
                  change="Complete your profile"
                  positive={true}
                />
                <DashboardCard
                  title="Account Status"
                  value="Active"
                  icon={<Shield className="text-lime-500" />}
                  change="All systems good"
                  positive={true}
                />
                <DashboardCard
                  title="Support Tickets"
                  value="2"
                  icon={<Ticket className="text-purple-400" />}
                  change="1 pending response"
                  positive={false}
                />
                <DashboardCard
                  title="Member Since"
                  value={new Date(user?.createdAt).getFullYear()}
                  icon={<Calendar className="text-green-400" />}
                  change="Trusted member"
                  positive={true}
                />
              </div>

              {/* Profile Overview */}
              <div className="bg-neutral-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Account Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <ProfileInfoItem
                      icon={<Mail className="text-blue-400" />}
                      label="Email"
                      value={user?.email || 'Not provided'}
                    />
                    <ProfileInfoItem
                      icon={<Phone className="text-green-400" />}
                      label="Phone"
                      value={user?.phone || 'Not provided'}
                    />
                  </div>
                  <div className="space-y-4">
                    <ProfileInfoItem
                      icon={<MapPin className="text-red-400" />}
                      label="Address"
                      value={user?.address || 'Not provided'}
                    />
                    <ProfileInfoItem
                      icon={<Calendar className="text-purple-400" />}
                      label="Joined"
                      value={new Date(user?.createdAt).toLocaleDateString()}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-neutral-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveSection('orders')}
                    className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    View Orders
                  </button>
                  <button 
                    onClick={() => setActiveSection('profile')}
                    className="flex items-center justify-center px-4 py-3 bg-lime-500 text-black rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => setActiveSection('security')}
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Key className="w-5 h-5 mr-2" />
                    Change Password
                  </button>
                  <button 
                    onClick={() => setActiveSection('support')}
                    className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Get Support
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">My Orders</h1>
              <Orders />
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
              
              <div className="bg-neutral-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Edit Profile Information</h2>
                <form onSubmit={profileFormik.handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileFormik.values.name}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-colors ${
                          profileFormik.touched.name && profileFormik.errors.name
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-neutral-700'
                        }`}
                      />
                      {profileFormik.touched.name && profileFormik.errors.name && (
                        <p className="mt-1 text-sm text-red-400 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {profileFormik.errors.name}
                        </p>
                      )}
                    </div>
                    
                    {/* Email Address */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileFormik.values.email}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-colors ${
                          profileFormik.touched.email && profileFormik.errors.email
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-neutral-700'
                        }`}
                      />
                      {profileFormik.touched.email && profileFormik.errors.email && (
                        <p className="mt-1 text-sm text-red-400 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {profileFormik.errors.email}
                        </p>
                      )}
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Phone Number <span className="text-neutral-500 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileFormik.values.phone}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-colors ${
                          profileFormik.touched.phone && profileFormik.errors.phone
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-neutral-700'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {profileFormik.touched.phone && profileFormik.errors.phone && (
                        <p className="mt-1 text-sm text-red-400 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {profileFormik.errors.phone}
                        </p>
                      )}
                    </div>
                    
                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Address <span className="text-neutral-500 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileFormik.values.address}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-colors ${
                          profileFormik.touched.address && profileFormik.errors.address
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-neutral-700'
                        }`}
                        placeholder="123 Main St, City, Country"
                      />
                      {profileFormik.touched.address && profileFormik.errors.address && (
                        <p className="mt-1 text-sm text-red-400 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {profileFormik.errors.address}
                        </p>
                      )}
                    </div>
                    
                    {/* Bio */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Bio <span className="text-neutral-500 text-xs">(Optional - Max 500 characters)</span>
                      </label>
                      <textarea
                        name="bio"
                        value={profileFormik.values.bio}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        rows="4"
                        className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-colors ${
                          profileFormik.touched.bio && profileFormik.errors.bio
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-neutral-700'
                        }`}
                        placeholder="Tell us about yourself..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          {profileFormik.touched.bio && profileFormik.errors.bio && (
                            <p className="text-sm text-red-400 flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {profileFormik.errors.bio}
                            </p>
                          )}
                        </div>
                        <p className={`text-xs ${
                          profileFormik.values.bio?.length > 450 
                            ? 'text-yellow-400' 
                            : 'text-neutral-500'
                        }`}>
                          {profileFormik.values.bio?.length || 0}/500 characters
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || profileFormik.isSubmitting || !profileFormik.isValid}
                      className="flex items-center px-6 py-3 bg-lime-500 text-black rounded-lg hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {loading || profileFormik.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Security Settings</h1>
              
              <div className="bg-neutral-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>
                
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-300">Password Requirements</p>
                      <ul className="text-sm text-blue-200 mt-2 space-y-1">
                        <li>• At least 6 characters long</li>
                        <li>• Must contain at least one letter</li>
                        <li>• Must be different from your current password</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={passwordFormik.handleSubmit} className="space-y-6 max-w-lg">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Current Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordFormik.values.currentPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-colors ${
                        passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-neutral-700'
                      }`}
                    />
                    {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {passwordFormik.errors.currentPassword}
                      </p>
                    )}
                  </div>
                  
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      New Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-colors ${
                        passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-neutral-700'
                      }`}
                    />
                    {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {passwordFormik.errors.newPassword}
                      </p>
                    )}
                  </div>
                  
                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Confirm New Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-colors ${
                        passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-neutral-700'
                      }`}
                    />
                    {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {passwordFormik.errors.confirmPassword}
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || passwordFormik.isSubmitting || !passwordFormik.isValid}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    {loading || passwordFormik.isSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeSection === 'support' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Support</h1>
              <UserSupport />
            </div>
          )}

          {activeSection === 'danger' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Account Settings</h1>
              
              <div className="bg-neutral-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Danger Zone</h2>
                
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-6 h-6 text-red-400 mr-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-300 mb-2">
                        Delete Account
                      </h3>
                      <p className="text-red-200 mb-4">
                        Once you delete your account, there is no going back. Please be certain. 
                        This will permanently delete your CampGear account and remove all associated data.
                      </p>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 rounded-lg max-w-md w-full p-6 border border-neutral-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Delete Account?
              </h3>
            </div>
            
            <p className="text-neutral-300 mb-6">
              This action cannot be undone. This will permanently delete your CampGear account and remove all your data from our servers.
            </p>
            
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-neutral-300 font-medium mb-2">
                You will lose access to:
              </p>
              <ul className="space-y-1 text-sm text-neutral-400">
                <li>• Your camping gear rental history</li>
                <li>• Saved equipment preferences</li>
                <li>• Support tickets and feedback</li>
                <li>• Account settings and data</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardCard({ title, value, icon, change, positive }) {
  return (
    <div className="bg-neutral-900 rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <p className="text-sm text-neutral-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className={`mt-4 text-sm ${positive ? 'text-lime-500' : 'text-neutral-400'}`}>
        {change}
      </div>
    </div>
  )
}

function ProfileInfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-neutral-400">{label}</p>
        <p className="text-white font-medium">{value}</p>
      </div>
    </div>
  )
}

export default UserDashboard