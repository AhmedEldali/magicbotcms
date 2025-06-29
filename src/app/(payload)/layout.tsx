// src/app/(payload)/layout.tsx

import config from '@payload-config'
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { importMap } from './admin/importMap.js'
import './custom.scss'

export const metadata = {
  title: 'MagicBot CMS',
  description: 'Multi-tenant CMS for Telegram AI bot',
}

type Args = {
  children: React.ReactNode
}

export default async function Layout({ children }: Args) {
  const serverFunction = async function (args: Record<string, unknown>) {
    'use server'
    return handleServerFunctions({
      ...args,
      config, // <-- config is used here, on the server-side
      importMap,
    })
  }

  return (
    // Ensure 'config' prop is NOT present here.
    <RootLayout importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
