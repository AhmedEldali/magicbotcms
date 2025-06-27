import { CollectionConfig } from 'payload/types'

const AiBots: CollectionConfig = {
  slug: 'ai_bots',
  admin: {
    // Note: Client AI bots
    defaultColumns: ['bot_name', 'service_type', 'linked_client'],
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
      // No explicit 'template' like Directus, Payload UI handles this automatically
    },
  ],
}

export default AiBots
