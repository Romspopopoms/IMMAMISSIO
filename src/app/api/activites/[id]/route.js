// ============================================================================
// src/app/api/activites/[id]/route.js - API pour une activité spécifique
// ============================================================================

// GET - Récupérer une activité par ID
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const activite = await prisma.activite.findUnique({
      where: { id },
      include: {
        section: true,
        paroisse: {
          select: {
            nom: true,
            subdomain: true,
            telephone: true,
            email: true
          }
        }
      }
    })

    if (!activite) {
      return NextResponse.json({ error: 'Activité non trouvée' }, { status: 404 })
    }

    return NextResponse.json(activite)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'activité' },
      { status: 500 }
    )
  }
}

// PUT - Modifier une activité
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Vérifier que l'activité existe et appartient à la paroisse de l'utilisateur
    const activiteExistante = await prisma.activite.findUnique({
      where: { id },
      include: { paroisse: true }
    })

    if (!activiteExistante) {
      return NextResponse.json({ error: 'Activité non trouvée' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.paroisseId !== activiteExistante.paroisseId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const {
      titre,
      description,
      image,
      horaires,
      lieu,
      ageMin,
      ageMax,
      contact,
      responsable,
      infosComplementaires,
      sectionId,
      ordre,
      actif
    } = data

    const activite = await prisma.activite.update({
      where: { id },
      data: {
        ...(titre !== undefined && { titre }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(horaires !== undefined && { horaires }),
        ...(lieu !== undefined && { lieu }),
        ...(ageMin !== undefined && { ageMin: ageMin ? parseInt(ageMin) : null }),
        ...(ageMax !== undefined && { ageMax: ageMax ? parseInt(ageMax) : null }),
        ...(contact !== undefined && { contact }),
        ...(responsable !== undefined && { responsable }),
        ...(infosComplementaires !== undefined && { infosComplementaires }),
        ...(sectionId !== undefined && { sectionId }),
        ...(ordre !== undefined && { ordre: parseInt(ordre) }),
        ...(actif !== undefined && { actif })
      },
      include: {
        section: true,
        paroisse: {
          select: {
            nom: true,
            subdomain: true
          }
        }
      }
    })

    return NextResponse.json(activite)
  } catch (error) {
    console.error('Erreur lors de la modification de l\'activité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'activité' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une activité
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await params

    // Vérifier que l'activité existe et appartient à la paroisse de l'utilisateur
    const activiteExistante = await prisma.activite.findUnique({
      where: { id },
      include: { paroisse: true }
    })

    if (!activiteExistante) {
      return NextResponse.json({ error: 'Activité non trouvée' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.paroisseId !== activiteExistante.paroisseId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await prisma.activite.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Activité supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'activité' },
      { status: 500 }
    )
  }
}
