'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function ParishHeader({ paroisse, isEditMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ImaMissio
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="text-xs lg:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">La Paroisse</Link>
            <Link href={`/site/${paroisse.subdomain}/pastorale${isEditMode ? '?edit=true' : ''}`} className="text-xs lg:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Pastorale</Link>
            <Link href={`/site/${paroisse.subdomain}/sacrements${isEditMode ? '?edit=true' : ''}`} className="text-xs lg:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Sacrements</Link>
            <Link href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="text-xs lg:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Actualités</Link>
            <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="text-xs lg:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Agenda</Link>
            <Link href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="text-xs lg:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Activités</Link>
            <Link href={`/site/${paroisse.subdomain}/don${isEditMode ? '?edit=true' : ''}`} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 lg:px-6 py-2 rounded-full text-xs lg:text-sm font-medium hover:shadow-lg transition-all">Don</Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-1 max-h-screen overflow-y-auto">
            <Link 
              href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} 
              className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              La Paroisse
            </Link>
            <Link 
              href={`/site/${paroisse.subdomain}/pastorale${isEditMode ? '?edit=true' : ''}`} 
              className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pastorale
            </Link>
            <Link 
              href={`/site/${paroisse.subdomain}/sacrements${isEditMode ? '?edit=true' : ''}`} 
              className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sacrements
            </Link>
            <Link 
              href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} 
              className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Actualités
            </Link>
            <Link 
              href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} 
              className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Agenda
            </Link>
            <Link 
              href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} 
              className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Activités
            </Link>
            <Link 
              href={`/site/${paroisse.subdomain}/don${isEditMode ? '?edit=true' : ''}`} 
              className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg text-sm font-medium mx-0 my-2 text-center hover:shadow-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Don
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}