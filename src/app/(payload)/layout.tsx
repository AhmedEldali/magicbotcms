// src/app/(payload)/layout.tsx

import config from '@payload-config' // Import your Payload config
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts' // Import handleServerFunctions
import React from 'react' // React is needed for JSX

import { importMap } from './admin/importMap.js' // Import your importMap for custom components
import './custom.scss' // Your custom styles

export const metadata = {
  title: 'MagicBot CMS',
  description: 'Multi-tenant CMS for Telegram AI bot', // Updated description is fine
}

type Args = {
  children: React.ReactNode // Use React.ReactNode for clarity
}

export default async function Layout({ children }: Args) {
  // Define the server function to handle Payload's API calls
  const serverFunction = async function (args: Record<string, unknown>) {
    'use server' // This directive is essential for Next.js Server Actions
    return handleServerFunctions({
      ...args,
      config, // Pass your Payload config
      importMap, // Pass your import map
    })
  }

  return (
    // Pass config, importMap, and the serverFunction to RootLayout
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
