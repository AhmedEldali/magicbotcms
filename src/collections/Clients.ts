import { CollectionConfig } from 'payload/types'

const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    description: 'Client information', // Directus note mapping
    defaultColumns: ['name', 'email', 'phone', 'business_name'],
    // Use the `name` field as the title when referencing clients
    // This is similar to Directus's template: "{{name}}"
    // Payload uses a 'title' field or you can define custom admin.useAsTitle
    // Payload usually uses the first 'text' or 'email' field for this automatically.
  },
  fields: [
    // Payload automatically handles the 'id' (UUID for Postgres)
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Client Name',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
    },
    {
      name: 'phone',
      type: 'text', // Can be 'number' if you only expect digits, but 'text' is safer for phone numbers
      label: 'Phone Number',
    },
    {
      name: 'business_name',
      type: 'text',
      label: 'Business Name',
    },
  ],
}

export default Clients
