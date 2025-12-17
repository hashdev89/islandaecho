'use client'

import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Apple,
  Play as PlayIcon
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div>
                <h3 className="text-white text-lg font-semibold">Your Travel Journey Starts Here</h3>
                <p className="text-white/80 text-sm">Sign up and we&apos;ll send the best deals to you</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Your Email"
                className="px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900 text-base min-h-[44px] touch-manipulation w-full sm:w-auto"
              />
              <button style={{ background: '#A0FF07' }} className="text-gray-900 px-6 py-3 rounded-lg font-semibold hover:opacity-90 active:opacity-80 transition-all min-h-[44px] touch-manipulation w-full sm:w-auto">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Contact Us */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Contact Us</h3>
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">Phone Number</p>
                <p className="font-semibold text-white">+94 741 415 812</p>
                <p className="text-gray-400 text-sm mt-4">Email</p>
                <p className="font-semibold text-white">info@isleandecho.com</p>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
              <div className="space-y-3">
                {['About Us', 'Careers', 'Blog', 'Press', 'Gift Cards'].map((item) => (
                  <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Support</h3>
              <div className="space-y-3">
                {['Contact', 'Legal Notice', 'Privacy Policy', 'Terms and Conditions', 'Sitemap'].map((item) => (
                  <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Other Services */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Other Services</h3>
              <div className="space-y-3">
                {['Car Hire', 'Activity Finder', 'Tour List', 'Flight Finder', 'Cruise Ticket', 'Holiday Rental', 'Travel Agents'].map((item) => (
                  <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Mobile</h3>
              <div className="space-y-4">
                <button className="flex items-center space-x-3 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors w-full min-h-[44px] touch-manipulation">
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Download on the</div>
                    <div className="text-sm font-semibold">Apple Store</div>
                  </div>
                </button>
                <button className="flex items-center space-x-3 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors w-full min-h-[44px] touch-manipulation">
                  <PlayIcon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0 text-sm">
              © 2024 by ISLE & ECHO. All rights reserved.
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex space-x-6">
                {['Privacy', 'Terms', 'Site Map'].map((item) => (
                  <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    {item}
                  </a>
                ))}
              </div>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                  <a key={index} href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
