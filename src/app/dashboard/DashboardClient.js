// ============================================================================
// src/app/dashboard/DashboardClient.js - Dashboard principal avec Activités
// ============================================================================
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Globe, 
  Users, 
  Calendar, 
  FileText, 
  LogOut, 
  ExternalLink,
  CheckCircle,
  Clock,
  BarChart3,
  Edit3,
  List,
  Plus,
  Heart,
  Target,
  Euro,
  Gift,
  Star,
  ArrowRight,
  TrendingUp,
  Activity,
  Paintbrush,
  Crown,
  Building,
  Settings
} from 'lucide-react'

export default function DashboardClient({ user, initialStats }) {
  const router = useRouter()
  const [greeting, setGreeting] = useState('')
  const [stats, setStats] = useState(initialStats)

  // Générer le greeting selon l'heure
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Bonjour')
    else if (hour < 18) setGreeting('Bon après-midi')
    else setGreeting('Bonsoir')
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Erreur logout:', error)
      router.push('/')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Chargement...</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Équipe Pastorale',
      description: 'Gérer les prêtres, conseils et secteurs',
      icon: Crown,
      href: '/dashboard/pastorale',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Activités Paroissiales',
      description: 'Gérer les sections et activités',
      icon: Activity,
      href: '/dashboard/activites',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Éditer le site en direct',
      description: 'Mode édition fluide sur votre site',
      icon: Paintbrush,
      href: `/site/${user.paroisse?.subdomain}?edit=true`,
      gradient: 'from-indigo-500 to-purple-500',
      external: true
    },
    {
      title: 'Gestion des dons',
      description: 'Projets et thématiques',
      icon: Heart,
      href: '/dashboard/dons',
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      title: 'Actualités',
      description: 'Gérer les actualités',
      icon: FileText,
      href: '/dashboard/actualites',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Événements',
      description: 'Créer et modifier',
      icon: Calendar,
      href: '/dashboard/evenements',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  const statsData = [
    {
      title: 'Actualités publiées',
      value: String(stats.actualites || 0),
      icon: FileText,
      change: stats.actualites > 0 ? 'Dernière récemment' : 'Créez votre première',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Événements à venir',
      value: String(stats.evenements || 0),
      icon: Calendar,
      change: stats.evenements > 0 ? 'Prochain bientôt' : 'Planifiez vos événements',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Total des dons',
      value: `${(stats.totalDons || 0).toLocaleString()}€`,
      icon: Euro,
      change: stats.totalDons > 0 ? 'Collectés cette année' : 'Activez les dons',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Projets actifs',
      value: String(stats.projets || 0),
      icon: Target,
      change: stats.projets > 0 ? 'En cours de collecte' : 'Créez vos projets',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  const features = [
    {
      icon: Crown,
      title: '1. Configurez votre équipe',
      description: 'Ajoutez vos prêtres, membres de conseils et responsables de secteurs',
      href: '/dashboard/pastorale',
      color: 'purple'
    },
    {
      icon: Activity,
      title: '2. Organisez vos activités',
      description: 'Créez des sections et ajoutez toutes les activités de votre paroisse',
      href: '/dashboard/activites',
      color: 'blue'
    },
    {
      icon: Paintbrush,
      title: '3. Personnalisez votre site',
      description: 'Modifiez directement les textes, images et couleurs sur vos pages',
      href: `/site/${user.paroisse?.subdomain}?edit=true`,
      color: 'indigo',
      external: true
    },
    {
      icon: Heart,
      title: '4. Configurez les dons',
      description: 'Créez vos projets de collecte et thématiques de dons',
      href: '/dashboard/dons',
      color: 'rose'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ImaMissio
              </Link>
              {user.paroisse && (
                <div className="ml-4 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {user.paroisse.nom}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Bouton Édition directe */}
              <Link
                href={`/site/${user.paroisse?.subdomain}?edit=true`}
                className="flex items-center text-gray-600 hover:text-purple-600 transition-colors bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl"
                title="Éditer le site en direct"
              >
                <Paintbrush className="w-4 h-4 mr-1" />
                <span className="hidden md:inline">Éditer</span>
              </Link>
              
              {user.paroisse && (
                <Link 
                  href={`/site/${user.paroisse.subdomain}`}
                  className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Voir le site
                </Link>
              )}
              
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {String(user.prenom?.charAt(0) || '')}{String(user.nom?.charAt(0) || '')}
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {String(user.prenom || '')} {String(user.nom || '')}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-xl"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            {greeting}, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{String(user.prenom || '')}</span> !
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gérez votre paroisse <strong>{String(user.paroisse?.nom || '')}</strong> depuis votre tableau de bord moderne et intuitif.
          </p>
        </div>

        {/* Success Message */}
        {user.paroisse && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8 mb-12 shadow-lg">
            <div className="flex items-start">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-green-900 mb-3">
                  🎉 Votre paroisse est en ligne !
                </h3>
                <p className="text-green-800 mb-6 text-lg">
                  Votre site <strong className="bg-green-200 px-2 py-1 rounded">{String(user.paroisse.subdomain)}.imamissio.com</strong> est maintenant accessible au public.
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link 
                    href={`/site/${user.paroisse.subdomain}`}
                    className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition-all font-semibold transform hover:scale-105 shadow-lg"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Visiter mon site
                  </Link>
                  <Link 
                    href={`/site/${user.paroisse.subdomain}?edit=true`}
                    className="inline-flex items-center bg-white text-green-700 px-6 py-3 rounded-2xl border-2 border-green-300 hover:bg-green-50 transition-all font-semibold transform hover:scale-105"
                  >
                    <Paintbrush className="w-5 h-5 mr-2" />
                    Éditer en direct
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Actions rapides</h2>
              <p className="text-gray-600">Gérez votre paroisse en quelques clics</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Activity className="w-4 h-4 mr-2" />
              Tableau de bord
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  className="group relative"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                    <div className="relative z-10">
                      <div className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {action.description}
                      </p>
                      <div className="flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Accéder</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        {action.external && <ExternalLink className="w-4 h-4 ml-1" />}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Aperçu</h2>
              <p className="text-gray-600">Statistiques de votre paroisse</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <BarChart3 className="w-4 h-4 mr-2" />
              Mis à jour maintenant
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {stat.change}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Guide de démarrage</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Suivez ces étapes pour configurer complètement votre site paroissial
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              const colors = {
                purple: 'from-purple-500 to-indigo-500',
                blue: 'from-blue-500 to-cyan-500',
                indigo: 'from-indigo-500 to-purple-500',
                rose: 'from-rose-500 to-pink-500'
              }
              
              return (
                <Link 
                  key={index} 
                  href={feature.href} 
                  target={feature.external ? "_blank" : undefined}
                  className="group"
                >
                  <div className="flex items-start p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer transform hover:scale-105">
                    <div className={`w-16 h-16 bg-gradient-to-br ${colors[feature.color]} rounded-2xl flex items-center justify-center mr-6 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Commencer</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        {feature.external && <ExternalLink className="w-4 h-4 ml-1" />}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}