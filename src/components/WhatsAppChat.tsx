'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MessageCircle, X } from 'lucide-react'

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false)
  // WhatsApp number format: country code + number without + or spaces
  const phoneNumber = '94741415812' // +94 741 415 812
  const message = encodeURIComponent('Hello! I would like to know more about your tours.')

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-3 sm:p-4 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
        aria-label="Open WhatsApp chat"
        style={{
          width: '56px',
          height: '56px',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)'
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        
        {/* Pulse animation */}
        {!isOpen && (
          <span 
            className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"
            style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
          />
        )}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#25D366] p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
                <Image
                  src="/logoisle&echo.png"
                  alt="ISLE & ECHO Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">ISLE & ECHO</h3>
                <p className="text-sm opacity-90">We&apos;re here to help!</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-4 text-sm">
              Hi! 👋 How can we help you plan your perfect Sri Lanka adventure?
            </p>
            
            <button
              onClick={handleClick}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>Start Chat on WhatsApp</span>
            </button>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Click to open WhatsApp
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

