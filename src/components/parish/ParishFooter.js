'use client'
import Link from 'next/link'

export default function ParishFooter({ paroisse, isEditMode }) {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ImaMissio
            </Link>
            <p className="text-gray-400 mt-2">Plateforme de gestion paroissiale</p>
          </div>
          
          <div className="flex space-x-8">
            <Link href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="text-gray-300 hover:text-white transition-colors">La Paroisse</Link>
            <Link href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="text-gray-300 hover:text-white transition-colors">Actualités</Link>
            <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="text-gray-300 hover:text-white transition-colors">Agenda</Link>
            <Link href={`/site/${paroisse.subdomain}/don${isEditMode ? '?edit=true' : ''}`} className="text-gray-300 hover:text-white transition-colors">Don</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 {paroisse.nom}. Tous droits réservés. 
            <span className="ml-2">Propulsé par <span className="text-blue-400 font-semibold">ImaMissio</span></span>
          </p>
        </div>
      </div>
    </footer>
  )
}