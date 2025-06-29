import { CollectionConfig } from 'payload/types'

const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    description: 'Invoices for clients',
    defaultColumns: ['client', 'amount', 'status', 'due_date'],
  },
  fields: [
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
      hasMany: false,
      label: 'Client',
    },
    {
      name: 'amount',
      type: 'number', // Use 'number' for decimal, Payload handles precision
      required: true,
      label: 'Amount',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
      ],
      defaultValue: 'pending', // Set default as per your Directus schema
      label: 'Status',
    },
    {
      name: 'due_date',
      type: 'date',
      label: 'Due Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly', // Just date picker
        },
      },
    },
  ],
}

export default Invoices
