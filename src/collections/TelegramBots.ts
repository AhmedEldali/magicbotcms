import { CollectionConfig } from 'payload/types'

const TelegramBots: CollectionConfig = {
  slug: 'telegram_bots',
  admin: {
    description: 'Stores Telegram bot tokens for each client',
    defaultColumns: ['token', 'linked_client'],
  },
  fields: [
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true, // Telegram bot tokens are unique
      label: 'Telegram Bot Token',
    },
    {
      name: 'linked_client',
      type: 'relationship',
      relationTo: 'clients',
      hasMany: false,
      label: 'Linked Client',
      // If a Telegram bot MUST be linked to a client: required: true
    },
  ],
}

export default TelegramBots
