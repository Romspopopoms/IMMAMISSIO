// src/components/BaseModal.js
'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function BaseModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-4xl',
  headerGradient = 'from-blue-600 to-purple-600'
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={`bg-white rounded-3xl shadow-2xl ${maxWidth} w-full transform transition-all duration-300 scale-100 flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        style={{ height: '80vh', maxHeight: '80vh' }}
      >
        {/* Header - Fixed */}
        <div className={`px-8 py-6 text-white bg-gradient-to-r ${headerGradient} rounded-t-3xl flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">{title}</h2>
              {subtitle && <p className="text-white/80">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </div>

        {/* Footer - Fixed */}
        {footer && (
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}