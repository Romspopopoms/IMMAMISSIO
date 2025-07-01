// ============================================================================
// src/app/api/auth/register/route.js - Register sécurisé
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { hashPassword, generateToken } from '../../../../lib/auth'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { email, password, nom, prenom, role = 'PAROISSE_ADMIN', paroisse } = await request.json()

    // Validation des données
    if (!email || !password || !nom || !prenom) {
      return NextResponse.json(
        { error: 'Tous les champs personnels sont requis' },
        { status: 400 }
      )
    }

    if (role === 'PAROISSE_ADMIN' && (!paroisse || !paroisse.nom || !paroisse.subdomain)) {
      return NextResponse.json(
        { error: 'Les informations de la paroisse sont requises' },
        { status: 400 }
      )
    }

    // Nettoyer et valider le subdomain
    if (role === 'PAROISSE_ADMIN' && paroisse.subdomain) {
      const cleanSubdomain = paroisse.subdomain
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Remplacer les espaces par des tirets
        .replace(/[^a-z0-9-]/g, '')     // Garder seulement lettres, chiffres et tirets
        .replace(/^-+|-+$/g, '')        // Supprimer les tirets en début/fin
        .replace(/-+/g, '-')            // Remplacer les tirets multiples par un seul

      // Validation finale
      if (!cleanSubdomain || cleanSubdomain.length < 2) {
        return NextResponse.json(
          { error: 'Le nom de site doit contenir au moins 2 caractères valides' },
          { status: 400 }
        )
      }

      if (cleanSubdomain.length > 50) {
        return NextResponse.json(
          { error: 'Le nom de site ne peut pas dépasser 50 caractères' },
          { status: 400 }
        )
      }

      // Remplacer le subdomain par la version nettoyée
      paroisse.subdomain = cleanSubdomain
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Vérifier si le subdomain est déjà pris
    if (role === 'PAROISSE_ADMIN') {
      const existingParoisse = await prisma.paroisse.findUnique({
        where: { subdomain: paroisse.subdomain }
      })

      if (existingParoisse) {
        return NextResponse.json(
          { error: 'Ce nom de site est déjà utilisé. Veuillez en choisir un autre.' },
          { status: 400 }
        )
      }
    }

    // Hash du mot de passe
    const hashedPassword = await hashPassword(password)

    let createdUser

    if (role === 'PAROISSE_ADMIN') {
      // Créer la paroisse ET l'utilisateur admin en une transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Créer la paroisse
        const newParoisse = await tx.paroisse.create({
          data: {
            nom: paroisse.nom,
            adresse: paroisse.adresse || null,
            ville: paroisse.ville || null,
            codePostal: paroisse.codePostal || null,
            telephone: paroisse.telephone || null,
            email: paroisse.email || null,
            subdomain: paroisse.subdomain,
            plan: 'GRATUIT',
            actif: true
          }
        })

        // 2. Créer l'utilisateur admin lié à cette paroisse
        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            nom,
            prenom,
            role,
            paroisseId: newParoisse.id
          },
          include: {
            paroisse: {
              select: {
                id: true,
                nom: true,
                subdomain: true,
                plan: true,
                actif: true
              }
            },
            permissions: true
          }
        })

        // 3. Créer les données initiales de la paroisse
        await createInitialParoisseData(tx, newParoisse.id, newUser.id)

        return newUser
      })

      createdUser = result
    } else {
      // Créer juste l'utilisateur (cas d'un admin spécialisé ajouté plus tard)
      createdUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          nom,
          prenom,
          role
        },
        include: {
          paroisse: {
            select: {
              id: true,
              nom: true,
              subdomain: true,
              plan: true,
              actif: true
            }
          },
          permissions: true
        }
      })
    }

    // Générer le token avec 'userId' (cohérent)
    const token = generateToken({ userId: createdUser.id })

    // Stocker dans un cookie sécurisé
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    // Préparer les données sans le password
    const userData = {
      id: createdUser.id,
      email: createdUser.email,
      nom: createdUser.nom,
      prenom: createdUser.prenom,
      role: createdUser.role,
      paroisseId: createdUser.paroisseId,
      paroisse: createdUser.paroisse,
      permissions: createdUser.permissions
    }

    return NextResponse.json({
      success: true,
      user: userData,
      message: role === 'PAROISSE_ADMIN' 
        ? `Paroisse "${paroisse.nom}" créée avec succès !` 
        : 'Compte créé avec succès !'
    })

  } catch (error) {
    console.error('Erreur inscription:', error)
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }
      if (error.meta?.target?.includes('subdomain')) {
        return NextResponse.json(
          { error: 'Ce nom de site est déjà pris' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'inscription' },
      { status: 500 }
    )
  }
}

// Fonction helper pour créer les données initiales
async function createInitialParoisseData(tx, paroisseId, userId) {
  // Horaires par défaut
  const horaires = [
    { typeOffice: 'messe', jourSemaine: 0, heure: '09:00', description: 'Messe dominicale', paroisseId },
    { typeOffice: 'messe', jourSemaine: 0, heure: '11:00', description: 'Grand-messe', paroisseId },
    { typeOffice: 'messe', jourSemaine: 1, heure: '18:30', paroisseId },
    { typeOffice: 'messe', jourSemaine: 2, heure: '08:00', paroisseId },
    { typeOffice: 'messe', jourSemaine: 3, heure: '18:30', paroisseId },
    { typeOffice: 'adoration', jourSemaine: 4, heure: '17:00', description: 'Suivie de la messe à 18h30', paroisseId },
    { typeOffice: 'messe', jourSemaine: 4, heure: '18:30', paroisseId },
    { typeOffice: 'messe', jourSemaine: 5, heure: '08:00', paroisseId },
    { typeOffice: 'confession', jourSemaine: 5, heure: '17:00', paroisseId },
    { typeOffice: 'messe', jourSemaine: 6, heure: '18:30', description: 'Messe anticipée', paroisseId }
  ]

  await tx.horaire.createMany({ data: horaires })

  // Sacrements
  const sacrements = [
    { type: 'bapteme', nom: 'Baptême', description: 'Devenir enfant de Dieu et entrer dans la grande famille des chrétiens', paroisseId },
    { type: 'eucharistie', nom: 'Eucharistie', description: 'Recevoir le Corps du Christ pour la première fois', paroisseId },
    { type: 'confirmation', nom: 'Confirmation', description: 'Recevoir la force de l\'Esprit Saint pour témoigner', paroisseId },
    { type: 'mariage', nom: 'Mariage', description: 'S\'unir devant Dieu pour fonder une famille chrétienne', paroisseId },
    { type: 'ordination', nom: 'Ordination', description: 'Répondre à l\'appel de Dieu au service de l\'Église', paroisseId },
    { type: 'reconciliation', nom: 'Réconciliation', description: 'Recevoir le pardon de Dieu et retrouver la paix', paroisseId },
    { type: 'onction', nom: 'Onction des malades', description: 'Recevoir la force et le réconfort dans la maladie', paroisseId }
  ]

  await tx.sacrement.createMany({ data: sacrements })

  // Sections/Activités
  const sections = [
    { nom: 'jeunesse', titre: 'Jeunesse', description: 'Groupes de jeunes, aumônerie, scoutisme et activités pour les 12-25 ans', ordre: 1, paroisseId },
    { nom: 'catechese', titre: 'Catéchèse', description: 'Éveil à la foi et préparation aux sacrements pour les enfants', ordre: 2, paroisseId },
    { nom: 'etudiant', titre: 'Étudiants', description: 'Aumônerie étudiante et accompagnement spirituel des jeunes adultes', ordre: 3, paroisseId },
    { nom: 'adultes', titre: 'Adultes', description: 'Formation spirituelle, groupes de prière et retraites pour adultes', ordre: 4, paroisseId },
    { nom: 'musique', titre: 'Musique', description: 'Chœur paroissial, formation musicale et animation liturgique', ordre: 5, paroisseId },
    { nom: 'ateliers', titre: 'Ateliers', description: 'Ateliers créatifs, formation et activités manuelles', ordre: 6, paroisseId },
    { nom: 'solidarite', titre: 'Solidarité', description: 'Service des plus démunis, visites aux malades et solidarité paroissiale', ordre: 7, paroisseId }
  ]

  await tx.section.createMany({ data: sections })

  // Actualités de bienvenue
  const actualites = [
    {
      titre: 'Bienvenue sur notre nouveau site !',
      contenu: 'Nous sommes heureux de vous présenter notre nouveau site paroissial créé avec ImaMissio. Retrouvez toutes nos actualités, horaires et informations pratiques en un clic.',
      publiee: true,
      datePubli: new Date(),
      paroisseId,
      auteurId: userId
    },
    {
      titre: 'Inscription aux activités paroissiales',
      contenu: 'Les inscriptions aux différentes activités de la paroisse sont ouvertes ! Nous proposons des activités pour tous les âges. N\'hésitez pas à nous contacter.',
      publiee: true,
      datePubli: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      paroisseId,
      auteurId: userId
    }
  ]

  await tx.actualite.createMany({ data: actualites })

  // Événements à venir
  const evenements = [
    {
      titre: 'Messe de rentrée',
      description: 'Grande messe de rentrée suivie d\'un pot de l\'amitié',
      dateDebut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lieu: 'Église paroissiale',
      paroisseId
    },
    {
      titre: 'Formation biblique',
      description: 'Cycle de formation sur les Évangiles',
      dateDebut: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      lieu: 'Salle paroissiale',
      paroisseId
    }
  ]

  await tx.evenement.createMany({ data: evenements })

  // Activités d'exemple pour chaque section
  const sectionsCreated = await tx.section.findMany({
    where: { paroisseId },
    select: { id: true, nom: true }
  })

  const activitesExemples = []

  // Activités Jeunesse
  const jeunesseSection = sectionsCreated.find(s => s.nom === 'jeunesse')
  if (jeunesseSection) {
    activitesExemples.push(
      {
        titre: 'Aumônerie Collège',
        description: 'Rencontres hebdomadaires pour les collégiens, découverte de la foi et préparation aux sacrements.',
        horaires: 'Mercredi 17h-18h30',
        lieu: 'Salle paroissiale',
        ageMin: 11,
        ageMax: 15,
        responsable: 'Équipe d\'animation',
        sectionId: jeunesseSection.id,
        paroisseId,
        ordre: 1
      },
      {
        titre: 'Groupe Scout',
        description: 'Scoutisme catholique pour apprendre l\'autonomie, la solidarité et grandir dans la foi.',
        horaires: 'Samedi 14h-17h',
        lieu: 'Local scout',
        ageMin: 8,
        ageMax: 17,
        responsable: 'Chefs scout',
        sectionId: jeunesseSection.id,
        paroisseId,
        ordre: 2
      }
    )
  }

  // Activités Catéchèse
  const catecheseSection = sectionsCreated.find(s => s.nom === 'catechese')
  if (catecheseSection) {
    activitesExemples.push(
      {
        titre: 'Éveil à la foi',
        description: 'Découverte de Jésus et de la foi chrétienne pour les tout-petits à travers jeux et histoires.',
        horaires: 'Dimanche 10h-10h45',
        lieu: 'Salle d\'éveil',
        ageMin: 3,
        ageMax: 6,
        responsable: 'Équipe éveil à la foi',
        sectionId: catecheseSection.id,
        paroisseId,
        ordre: 1
      },
      {
        titre: 'Catéchisme CE-CM',
        description: 'Préparation à la première communion et approfondissement de la foi.',
        horaires: 'Mercredi 14h-15h30',
        lieu: 'Salles de catéchisme',
        ageMin: 7,
        ageMax: 11,
        responsable: 'Catéchistes',
        sectionId: catecheseSection.id,
        paroisseId,
        ordre: 2
      }
    )
  }

  // Activités Étudiants
  const etudiantSection = sectionsCreated.find(s => s.nom === 'etudiant')
  if (etudiantSection) {
    activitesExemples.push(
      {
        titre: 'Aumônerie Lycée',
        description: 'Accompagnement spirituel des lycéens, débats et temps forts.',
        horaires: 'Vendredi 18h-19h30',
        lieu: 'Foyer des jeunes',
        ageMin: 15,
        ageMax: 18,
        responsable: 'Aumônier',
        sectionId: etudiantSection.id,
        paroisseId,
        ordre: 1
      },
      {
        titre: 'Groupe étudiant',
        description: 'Rencontres pour les étudiants : partage, prière et convivialité.',
        horaires: 'Jeudi 20h-21h30',
        lieu: 'Presbytère',
        ageMin: 18,
        ageMax: 25,
        responsable: 'Équipe pastorale',
        sectionId: etudiantSection.id,
        paroisseId,
        ordre: 2
      }
    )
  }

  // Activités Adultes
  const adultesSection = sectionsCreated.find(s => s.nom === 'adultes')
  if (adultesSection) {
    activitesExemples.push(
      {
        titre: 'Groupe de prière',
        description: 'Temps de prière partagée et d\'intercession pour la paroisse et le monde.',
        horaires: 'Mardi 20h-21h',
        lieu: 'Église',
        ageMin: 18,
        responsable: 'Responsable prière',
        sectionId: adultesSection.id,
        paroisseId,
        ordre: 1
      },
      {
        titre: 'Formation biblique',
        description: 'Étude et partage autour des textes bibliques pour approfondir sa foi.',
        horaires: 'Jeudi 14h30-16h',
        lieu: 'Salle paroissiale',
        ageMin: 25,
        responsable: 'Animateur biblique',
        sectionId: adultesSection.id,
        paroisseId,
        ordre: 2
      }
    )
  }

  // Activités Musique
  const musiqueSection = sectionsCreated.find(s => s.nom === 'musique')
  if (musiqueSection) {
    activitesExemples.push(
      {
        titre: 'Chorale paroissiale',
        description: 'Chants liturgiques et animation des messes dominicales.',
        horaires: 'Jeudi 20h-21h30',
        lieu: 'Église',
        ageMin: 16,
        responsable: 'Chef de chœur',
        sectionId: musiqueSection.id,
        paroisseId,
        ordre: 1
      },
      {
        titre: 'Groupe de louange',
        description: 'Musique et chants de louange pour les célébrations spéciales.',
        horaires: 'Samedi 10h-11h30',
        lieu: 'Salle de musique',
        ageMin: 14,
        responsable: 'Équipe louange',
        sectionId: musiqueSection.id,
        paroisseId,
        ordre: 2
      }
    )
  }

  // Activités Ateliers
  const ateliersSection = sectionsCreated.find(s => s.nom === 'ateliers')
  if (ateliersSection) {
    activitesExemples.push(
      {
        titre: 'Atelier créatif',
        description: 'Travaux manuels et créations artistiques dans une ambiance conviviale.',
        horaires: 'Lundi 14h-16h',
        lieu: 'Salle d\'activités',
        ageMin: 25,
        responsable: 'Animateurs créatifs',
        sectionId: ateliersSection.id,
        paroisseId,
        ordre: 1
      },
      {
        titre: 'Couture paroissiale',
        description: 'Confection et réparation de vêtements liturgiques, aide aux familles.',
        horaires: 'Mercredi 9h-12h',
        lieu: 'Atelier couture',
        ageMin: 30,
        responsable: 'Équipe couture',
        sectionId: ateliersSection.id,
        paroisseId,
        ordre: 2
      }
    )
  }

  // Activités Solidarité
  const solidariteSection = sectionsCreated.find(s => s.nom === 'solidarite')
  if (solidariteSection) {
    activitesExemples.push(
      {
        titre: 'Visite aux malades',
        description: 'Accompagnement et visite des personnes âgées et malades de la paroisse.',
        horaires: 'Selon disponibilités',
        lieu: 'Domiciles et EHPAD',
        ageMin: 18,
        responsable: 'Équipe accompagnement',
        sectionId: solidariteSection.id,
        paroisseId,
        ordre: 1
      },
      {
        titre: 'Aide alimentaire',
        description: 'Distribution de colis alimentaires aux familles en difficulté.',
        horaires: 'Samedi 9h-11h',
        lieu: 'Local caritatif',
        ageMin: 16,
        responsable: 'Responsable Caritas',
        sectionId: solidariteSection.id,
        paroisseId,
        ordre: 2
      }
    )
  }

  // Créer toutes les activités d'exemple
  if (activitesExemples.length > 0) {
    await tx.activite.createMany({ data: activitesExemples })
  }
}