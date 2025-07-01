// src/components/Editable.js
'use client'
import { useState, useRef, useEffect } from 'react'
import { Upload, Edit3 } from 'lucide-react'

// Composant pour texte éditable
export function EditableText({ 
  value, 
  onChange, 
  isEditMode, 
  className = '',
  multiline = false,
  placeholder = 'Cliquez pour éditer'
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    setTempValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    onChange(tempValue)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setTempValue(value)
      setIsEditing(false)
    }
  }

  if (!isEditMode) {
    return <>{value || placeholder}</>
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`${className} w-full p-2 border rounded resize-none`}
          rows={4}
        />
      )
    }

    return (
      <input
        ref={inputRef}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`${className} px-2 py-1 border rounded`}
      />
    )
  }

  return (
    <span
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsEditing(true)
      }}
      className={`${className} cursor-pointer hover:bg-black/10 px-1 rounded transition-colors inline-flex items-center group`}
      title="Cliquez pour éditer"
    >
      {value || placeholder}
      <Edit3 className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </span>
  )
}

// Composant pour image éditable
export function EditableImage({ 
  src, 
  onChange, 
  isEditMode,
  className = '',
  style = {},
  alt = 'Image',
  children // Ajout pour permettre le contenu superposé
}) {
  const [isHovering, setIsHovering] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isEditMode) {
    return (
      <div 
        className={className}
        style={{
          backgroundImage: `url('${src}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          ...style
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        backgroundImage: `url('${src}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Indicateur permanent en mode édition */}
      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg flex items-center text-xs">
        <Edit3 className="w-3 h-3 mr-1" />
        Image éditable
      </div>
      
      {isHovering && (
        <div 
          className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer transition-opacity z-10"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="bg-white/90 px-4 py-2 rounded-lg flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Changer l'image
          </div>
        </div>
      )}
    </div>
  )
}