'use client'
import { useRouter } from 'next/navigation'
import { useEditable } from '../../../hooks/useEditable'
import EditBar from '../../../components/EditBar'

// Composants refactorisés importés
import ParishHeader from '../../../components/parish/ParishHeader'
import HeroSection from '../../../components/parish/HeroSection'
import NavigationSection from '../../../components/parish/NavigationSection'
import NewsSection from '../../../components/parish/NewsSection'
import ScheduleSection from '../../../components/parish/ScheduleSection'
import EventsSection from '../../../components/parish/EventsSection'
import ContactSection from '../../../components/parish/ContactSection'
import ParishFooter from '../../../components/parish/ParishFooter'

export default function ParishSiteClient({ paroisse: initialParoisse }) {
  const router = useRouter()
  
  // Hook d'édition
  const {
    isEditMode,
    hasChanges,
    saving,
    updateField,
    saveChanges,
    exitEditMode,
    getValue,
    data
  } = useEditable(initialParoisse)

  // Utiliser les données mises à jour
  const paroisse = { ...initialParoisse, ...data }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <EditBar 
        isEditMode={isEditMode}
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveChanges}
        onExit={exitEditMode}
      />

      {/* Header */}
      <ParishHeader 
        paroisse={paroisse}
        isEditMode={isEditMode}
      />

      {/* Hero Section */}
      <HeroSection 
        paroisse={paroisse}
        isEditMode={isEditMode}
        getValue={getValue}
        updateField={updateField}
      />

      {/* Navigation Section */}
      <NavigationSection 
        paroisse={paroisse}
        isEditMode={isEditMode}
        getValue={getValue}
        updateField={updateField}
      />

      {/* News Section */}
      <NewsSection 
        paroisse={paroisse}
        isEditMode={isEditMode}
        getValue={getValue}
        updateField={updateField}
      />

      {/* Schedule Section */}
      <ScheduleSection 
        paroisse={paroisse}
        isEditMode={isEditMode}
        getValue={getValue}
        updateField={updateField}
      />

      {/* Events Section */}
      <EventsSection 
        paroisse={paroisse}
        isEditMode={isEditMode}
        getValue={getValue}
        updateField={updateField}
      />

      {/* Contact Section */}
      <ContactSection 
        paroisse={paroisse}
        isEditMode={isEditMode}
        getValue={getValue}
        updateField={updateField}
      />

      {/* Footer */}
      <ParishFooter 
        paroisse={paroisse}
        isEditMode={isEditMode}
      />
    </div>
  )
}