// ============================================================================
// FICHIER 1 : src/lib/auth.js - Correction cookies() async
// ============================================================================
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// ✅ CORRECTION : Auth côté serveur avec cookies() async
export async function getServerAuth() {
  try {
    const cookieStore = await cookies() // ✅ Await ajouté pour Next.js 15
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        paroisse: true,
        permissions: true
      }
    })

    return user
  } catch (error) {
    console.error('Erreur auth serveur:', error)
    return null
  }
}

// ✅ CORRECTION : Middleware API avec cookies() async
export async function withAuth(handler) {
  return async (request) => {
    try {
      const cookieStore = await cookies() // ✅ Await ajouté
      const token = cookieStore.get('auth-token')?.value

      if (!token) {
        return Response.json({ error: 'Non autorisé' }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return Response.json({ error: 'Token invalide' }, { status: 401 })
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { paroisse: true, permissions: true }
      })

      if (!user) {
        return Response.json({ error: 'Utilisateur non trouvé' }, { status: 401 })
      }

      request.user = user
      return handler(request)
    } catch (error) {
      console.error('Erreur middleware auth:', error)
      return Response.json({ error: 'Erreur serveur' }, { status: 500 })
    }
  }
}

export function hasPermission(user, section, action = 'read') {
  if (!user) return false
  if (user.role === 'SUPER_ADMIN') return true
  if (user.role === 'PAROISSE_ADMIN') return true
  
  if (user.role === 'ADMIN_SPECIALISE') {
    const permissions = user.permissions || []
    return permissions.some(perm => {
      const sectionsAutorisees = perm.sectionsAutorisees.split(',')
      const permissionsAutorisees = perm.permissions.split(',')
      return sectionsAutorisees.includes(section) && permissionsAutorisees.includes(action)
    })
  }
  
  return action === 'read'
}
