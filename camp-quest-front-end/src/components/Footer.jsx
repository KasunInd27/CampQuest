
import React from 'react'
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Send,
} from 'lucide-react'
export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6">
              Camp<span className="text-[#8BE13B]">Quest</span>
            </h3>
            <p className="mb-6 text-gray-300">
              Your trusted partner for camping equipment rental and sales.
              Making outdoor adventures accessible to everyone.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-[#242424] p-2 rounded-full hover:bg-[#8BE13B] hover:text-[#1A1A1A] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-[#242424] p-2 rounded-full hover:bg-[#8BE13B] hover:text-[#1A1A1A] transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="bg-[#242424] p-2 rounded-full hover:bg-[#8BE13B] hover:text-[#1A1A1A] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-[#8BE13B]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Rental Equipment
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-[#8BE13B]">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Dilivery Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Return Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Rental Terms
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-[#8BE13B]">
              Stay Updated
            </h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for the latest gear and camping tips.
            </p>
            <div className="mb-6">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-3 bg-[#242424] text-white rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-[#8BE13B]"
                />
                <button className="bg-[#8BE13B] text-[#1A1A1A] px-4 py-3 rounded-r-md hover:bg-opacity-90 transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-4 text-[#8BE13B]">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <MapPin size={16} className="mr-3 text-[#8BE13B]" />
                <span>123 Adventure Ave, Outdoor City</span>
              </li>
              <li className="flex items-center text-gray-300">
                <Phone size={16} className="mr-3 text-[#8BE13B]" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center text-gray-300">
                <Mail size={16} className="mr-3 text-[#8BE13B]" />
                <span>info@campquest.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Camp Quest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
