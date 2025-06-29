import { CollectionConfig } from 'payload/types'

const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    description: 'Client information',
    useAsTitle: 'name', // Explicitly use 'name' as the title field
    defaultColumns: ['name', 'email', 'phone', 'business_name'],
    // Hidden from non-admin users in the admin UI
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    // Only admins can create clients
    create: ({ req }) => req.user?.role === 'admin',
    // Only admins can delete clients
    delete: ({ req }) => req.user?.role === 'admin',
    // Only admins can update any client
    // Client users can only update their own linked client (if allowed, typically not for this collection)
    update: ({ req }) => req.user?.role === 'admin',
    // Read Access:
    // - Admins can read all clients.
    // - Client users can only read their OWN client record.
    read: ({ req }) => {
      // Allow admin users to read all documents
      if (req.user?.role === 'admin') {
        return true
      }
      // Allow client users to read only their own linked client record
      if (req.user?.role === 'client' && req.user.client) {
        const userClientId =
          typeof req.user.client === 'object' ? req.user.client.id : req.user.client
        return {
          id: {
            equals: userClientId, // Only return the client record that matches the user's linked client ID
          },
        }
      }
      // Deny access by default for unauthenticated users or users with no matching role/client
      return false
    },
  },
  fields: [
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
      unique: true, // Ensure email addresses are unique
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'business_name',
      type: 'text',
      label: 'Business Name',
      // You might consider making this unique too, depending on your business rules
      // unique: true,
    },
  ],
}

export default Clients
