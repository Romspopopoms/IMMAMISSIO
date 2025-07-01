// ============================================================================
// src/app/api/sections/route.js - API pour les sections/catégories
// ============================================================================

// GET - Récupérer toutes les sections d'une paroisse
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const paroisseId = searchParams.get('paroisseId')
    const subdomain = searchParams.get('subdomain')

    let whereClause = {}

    if (paroisseId) {
      whereClause.paroisseId = paroisseId
    } else if (subdomain) {
      whereClause.paroisse = { subdomain }
    }

    const sections = await prisma.section.findMany({
      where: {
        ...whereClause,
        actif: true
      },
      include: {
        activites: {
          where: { actif: true },
          orderBy: { ordre: 'asc' }
        },
        paroisse: {
          select: {
            nom: true,
            subdomain: true
          }
        }
      },
      orderBy: [
        { ordre: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Erreur lors de la récupération des sections:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sections' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle section
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const data = await request.json()
    const {
      nom,
      titre,
      description,
      couleur,
      icone,
      image,
      paroisseId,
      contenu,
      ordre = 0
    } = data

    // Vérifier que l'utilisateur a les droits sur cette paroisse
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { paroisse: true }
    })

    if (!user || user.paroisseId !== paroisseId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const section = await prisma.section.create({
      data: {
        nom,
        titre,
        description,
        couleur,
        icone,
        image,
        paroisseId,
        contenu,
        ordre: parseInt(ordre)
      },
      include: {
        activites: true,
        paroisse: {
          select: {
            nom: true,
            subdomain: true
          }
        }
      }
    })

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la section:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la section' },
      { status: 500 }
    )
  }
}