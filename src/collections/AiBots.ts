// D:\Magicbot\Backend\src\collections\AiBots.ts (or wherever your collection config is)

import { CollectionConfig } from 'payload/types'

const AiBots: CollectionConfig = {
  slug: 'ai_bots',
  admin: {
    defaultColumns: ['bot_name', 'service_type', 'linked_client'],
  },
  // Add the access property here:
  access: {
    read: () => true, // Allows ANYONE (authenticated or not) to read documents
    // Optionally, you can explicitly set other access rules:
    // create: ({ req }) => req.user ? true : false, // Only logged-in users can create
    // update: ({ req }) => req.user ? true : false, // Only logged-in users can update
    // delete: ({ req }) => req.user ? true : false, // Only logged-in users can delete
  },
  fields: [
    {
      name: 'bot_name',
      type: 'text',
      required: true,
      label: 'Bot Name',
    },
    {
      name: 'service_type',
      type: 'text',
      label: 'Service Type',
    },
    {
      name: 'linked_client',
      type: 'relationship',
      relationTo: 'clients', // Links to the 'clients' collection
      hasMany: false, // This is a many-to-one (one bot linked to one client)
      label: 'Linked Client',
    },
  ],
}

export default AiBots
