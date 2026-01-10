'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Globe
} from 'lucide-react'
import Header from '../../components/Header'

// Dynamically import ContactMap to reduce initial bundle size
const ContactMap = dynamic(() => import('../../components/ContactMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
      <div className="text-center">
        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Visit Us',
      details: '55/A, Kulupana, Pokunuwita, Sri Lanka',
     
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Call Us',
      details: '+94 741 415 812',
 
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Us',
      details: 'info@isleandecho.com',

    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Business Hours',
      details: 'Mon - Fri: 9:00 AM - 6:00 PM',
      description: 'Saturday: 9:00 AM - 2:00 PM'
    }
  ]

  const officeLocations = [
    {
      city: 'Colombo',
      address: '123 Travel Street, Colombo 01',
      phone: '+94 11 234 5678',
      email: 'colombo@isleandecho.com',
      hours: 'Mon-Fri: 9AM-6PM'
    },
    {
      city: 'Kandy',
      address: '456 Hill Street, Kandy',
      phone: '+94 81 234 5678',
      email: 'kandy@isleandecho.com',
      hours: 'Mon-Fri: 9AM-5PM'
    },
    {
      city: 'Galle',
      address: '789 Fort Road, Galle',
      phone: '+94 91 234 5678',
      email: 'galle@isleandecho.com',
      hours: 'Mon-Fri: 9AM-5PM'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">Get in Touch</h1>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto opacity-90 px-2">
            Have questions about your Sri Lanka adventure? We&apos;re here to help you plan the perfect trip.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600">
                    {info.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{info.title}</h3>
                <p className="text-blue-600 font-medium mb-2">{info.details}</p>
                <p className="text-gray-600 text-sm">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="booking">Booking Question</option>
                      <option value="custom-tour">Custom Tour Request</option>
                      <option value="support">Customer Support</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Tell us about your travel plans or any questions you have..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* Map and Office Locations */}
            <div className="space-y-8">
              {/* Mapbox Map */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Our Location</h2>
                <ContactMap
                  lat={6.72603}
                  lng={80.03396}
                  address="55/A, Kulupana, Pokunuwita, Sri Lanka"
                />
                <div className="mt-4 text-center">
                  <p className="text-gray-600 font-medium">55/A, Kulupana, Pokunuwita, Sri Lanka</p>
              
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                question: "How far in advance should I book my tour?",
                answer: "We recommend booking at least 2-3 months in advance for peak season (December to April) and 1-2 months for off-peak season to ensure availability and the best rates."
              },
              {
                question: "What is your cancellation policy?",
                answer: "We offer flexible cancellation policies. Full refunds are available up to 30 days before departure, with partial refunds available up to 7 days before. Please check your specific tour details for exact terms."
              },
              {
                question: "Do you offer custom tours?",
                answer: "Absolutely! We specialize in creating personalized experiences. Contact us with your requirements and we'll craft a custom itinerary that matches your interests, budget, and timeline."
              },
              {
                question: "What should I pack for my Sri Lanka trip?",
                answer: "Pack lightweight, breathable clothing, comfortable walking shoes, sunscreen, insect repellent, and a hat. For temple visits, bring modest clothing that covers shoulders and knees."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
