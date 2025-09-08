import { loadStripe } from '@stripe/stripe-js'

// Validation de la clé publique Stripe côté client
if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is required')
}

let stripePromise = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
    )
  }
  return stripePromise
}