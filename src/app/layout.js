// ============================================================================
// FICHIER 1 : src/app/layout.js - Layout principal
// ============================================================================
import { Inter } from 'next/font/google'
import './globals.css'
import ProvidersWrapper from '../components/ProvidersWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ImaMissio - Plateforme moderne pour paroisses',
  description: 'Site web et application mobile pour votre paroisse',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ProvidersWrapper>
          {children}
        </ProvidersWrapper>
      </body>
    </html>
  )
}