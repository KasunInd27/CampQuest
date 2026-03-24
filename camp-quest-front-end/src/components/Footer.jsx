
import React from 'react'
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Send,
} from 'lucide-react';
import { FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa';
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
                href="https://www.facebook.com/share/1LNfqHW9M5/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#242424] p-2 rounded-full hover:bg-[#8BE13B] hover:text-[#1A1A1A] transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@camp_quest2.0?_r=1&_t=ZS-933ttDUzD17"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#242424] p-2 rounded-full hover:bg-[#8BE13B] hover:text-[#1A1A1A] transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok size={20} />
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=%2B94741245709&fbclid=IwY2xjawPUSTVleHRuA2FlbQIxMABicmlkETFPSjZxbVpzT285azZVY0F2c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHn5BiFqLHa82zWEbv3B0RFNiadiznTJ_XjCjbrzcItx3_qWhfpzThfhyTmZb_aem_FRyEmuSiRGvEL5nmX_mDpw"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#242424] p-2 rounded-full hover:bg-[#8BE13B] hover:text-[#1A1A1A] transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={20} />
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
                <Link
                  to="/"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/rent"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Rental Equipment
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Blog
                </Link>
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
                <Link
                  to="/support"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  FAQ & Support
                </Link>
              </li>
              <li>
                <Link
                  to="/delivery-policy"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Return Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/rental-terms"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Rental Terms
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-gray-300 hover:text-[#8BE13B] transition-colors"
                >
                  Terms of Service
                </Link>
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
                <MapPin size={16} className="mr-3 text-[#8BE13B] shrink-0" />
                <span>Katupilagolla, Dodangaslanda</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Phone size={16} className="mr-3 mt-1 text-[#8BE13B] shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:0741245709" className="hover:text-[#8BE13B] transition-colors">074 1245 709</a>
                  <a href="tel:0726558586" className="hover:text-[#8BE13B] transition-colors">072 6558 586</a>
                </div>
              </li>
              <li className="flex items-center text-gray-300">
                <Mail size={16} className="mr-3 text-[#8BE13B] shrink-0" />
                <a href="mailto:campquest512@gmail.com" className="hover:text-[#8BE13B] transition-colors">campquest512@gmail.com</a>
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
