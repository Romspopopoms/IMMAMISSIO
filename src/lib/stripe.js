import Stripe from 'stripe'

// Utiliser les clés de test en développement
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
})

export default stripe

// Configuration des prix par défaut (en centimes)
export const DONATION_AMOUNTS = {
  10: 1000,
  20: 2000,
  50: 5000,
  100: 10000,
  200: 20000,
  500: 50000
}