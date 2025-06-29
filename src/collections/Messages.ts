import { CollectionConfig } from 'payload/types'

const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    description: 'Messages sent by bots',
    defaultColumns: ['message_text', 'platform', 'sent_at'],
  },
  fields: [
    {
      name: 'message_text',
      type: 'textarea', // Use 'textarea' for multiline text
      required: true,
      label: 'Message Text',
    },
    {
      name: 'platform',
      type: 'select', // Use 'select' for predefined choices
      required: true,
      options: [
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Telegram', value: 'telegram' },
      ],
      label: 'Platform',
    },
    {
      name: 'sent_at',
      type: 'date', // Payload's 'date' field supports date and time
      label: 'Sent At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime', // Shows both date and time picker
        },
      },
    },
    {
      name: 'related_bot', // Assuming messages are sent by a specific bot
      type: 'relationship',
      relationTo: 'ai_bots',
      hasMany: false,
      label: 'Related Bot',
      // This implicitly allows messages to be linked to an AI bot.
      // You can add 'required: true' if every message MUST have a bot.
    },
  ],
}

export default Messages
