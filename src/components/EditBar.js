// src/components/EditBar.js
'use client'
import { Save, X, AlertCircle, Edit3, Eye, Sparkles } from 'lucide-react'

export default function EditBar({ 
  isEditMode, 
  hasChanges, 
  saving,
  onSave, 
  onExit 
}) {
  if (!isEditMode) return null

  return (
    <>
      {/* Barre d'édition en bas à gauche pour ne pas gêner la navbar */}
      <div className="fixed bottom-8 left-8 z-40 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-sm max-w-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold">Mode Édition</span>
              <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
            </div>
            <span className="text-blue-100 text-xs">Cliquez pour modifier</span>
          </div>
        </div>

        {/* Notification de changements */}
        {hasChanges && (
          <div className="bg-white/10 rounded-xl p-3 mb-3 border border-white/20">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-300" />
              <span className="text-xs text-white font-medium">Modifications en attente</span>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex space-x-2">
          {/* Bouton Quitter */}
          <button
            onClick={onExit}
            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3 py-2 rounded-xl transition-all duration-200 flex items-center justify-center text-sm font-medium"
          >
            <X className="w-3 h-3 mr-1" />
            Quitter
          </button>
          
          {/* Bouton Sauvegarder */}
          <button
            onClick={onSave}
            disabled={saving || !hasChanges}
            className={`flex-1 px-3 py-2 rounded-xl transition-all duration-200 flex items-center justify-center text-sm font-medium ${
              saving || !hasChanges
                ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            {saving ? (
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <Save className="w-3 h-3 mr-1" />
            )}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Indicateur visuel discret du mode édition */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 z-30 pointer-events-none"></div>
    </>
  )
}