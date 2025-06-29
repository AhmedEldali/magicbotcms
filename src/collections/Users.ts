import type { CollectionConfig } from 'payload/types'

// NOTE: The `declare module 'payload'` block should be in a separate .d.ts file,
//       e.g., `src/payload-custom-types.d.ts` or `src/globals.d.ts`,
//       and NOT directly in this collection file.
//       This ensures global type augmentation.

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    // Using `hidden` to hide the Users collection in the admin UI sidebar for non-admins.
    // Consider `use` if you want to prevent direct URL access to the admin list view for non-admins.
    hidden: ({ user }: { user: { role?: string } }) => !user || user.role !== 'admin',
    defaultColumns: ['email', 'role', 'client'], // Show these columns in the admin list view
  },
  auth: true, // Enables authentication for this collection
  access: {
    // READ access:
    // - Admins can read all users.
    // - Client users can read their own user record and potentially other users within their client.
    read: ({ req }: { req: import('payload/types').PayloadRequest }) => {
      // Explicitly typed
      // Admins can read all users
      if (req.user && req.user.role === 'admin') {
        return true
      }
      // Client users can read their own user record and users linked to their client
      if (req.user && req.user.role === 'client' && req.user.client) {
        const userClientId =
          typeof req.user.client === 'object' ? req.user.client.id : req.user.client
        return {
          or: [
            { id: { equals: req.user.id } }, // User can read themselves
            { client: { equals: userClientId } }, // User can read others in their client
          ],
        }
      }
      // Deny access by default
      return false
    },
    // CREATE access: Only admins can create new users.
    create: ({ req }) => {
      // Type inferred from global augmentation
      return !!req.user && req.user.role === 'admin'
    },
    // UPDATE access:
    // - Admins can update any user.
    // - Client users can only update their *own* user record.
    update: ({ req, data }) => {
      // Type inferred from global augmentation
      if (req.user && req.user.role === 'admin') {
        return true
      }
      // Allow a user to update their own record
      // Ensure req.user.id is correctly compared; Payload IDs are strings or numbers.
      // String() conversion is robust.
      return !!req.user && String(req.user.id) === String(data.id)
    },
    // DELETE access: Only admins can delete users.
    delete: ({ req }) => {
      // Type inferred from global augmentation
      return !!req.user && req.user.role === 'admin'
    },
  },
  fields: [
    // Email and password fields are automatically added by `auth: true`
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Client', value: 'client' }, // Your tenant-specific user role
      ],
      defaultValue: 'client', // Most new users will be clients
      required: true,
      admin: {
        // Only admins can change a user's role
        readOnly: ({ req }) => req.user.role !== 'admin', // Type inferred
      },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients', // Link to your 'clients' collection (which acts as tenants)
      required: false, // An admin user might not have a client
      hasMany: false, // Each user belongs to one client
      admin: {
        // Admins can freely select the client for any user
        // Client users cannot change their own linked client through the admin UI
        readOnly: ({ req }: { req: { user: { role?: string } } }) =>
          req.user && req.user.role === 'client', // Explicitly typed
      },
      // Hook to ensure that if a client user is creating another user, that new user
      // is also automatically linked to the same client.
      hooks: {
        beforeChange: [
          ({
            req,
            data,
          }: {
            req: import('payload/types').PayloadRequest
            data: { client?: string | { id: string } }
          }) => {
            // Explicitly typed
            // If the logged-in user is a 'client' and has a client associated,
            // ensure any user they create or update is also linked to that same client.
            if (req.user && req.user.role === 'client' && req.user.client) {
              return typeof req.user.client === 'object' ? req.user.client.id : req.user.client
            }
            // If admin or no client associated, return the provided data.client value.
            return data.client
          },
        ],
      },
    },
    // Add more fields here specific to your users if needed (e.g., firstName, lastName, phone, etc.)
  ],
  // Add a hook to populate the 'client' relationship on the 'req.user' object after login
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        // Type inferred
        // Ensure user.client is populated if it's just an ID string
        if (user && user.client && typeof user.client === 'string') {
          try {
            const client = await req.payload.findByID({
              collection: 'clients', // Make sure this matches your client/tenant slug
              id: user.client,
              depth: 0, // We only need the top-level client data
            })
            if (client && req.user) {
              // Ensure req.user exists before assigning
              // Attach the populated client object to req.user
              req.user.client = {
                id: client.id,
                name: client.name as string, // Cast to string if type is 'text'
                // Add any other fields from your Client collection you need for access control/context
              }
            }
          } catch (error: unknown) {
            // Type the error for safety
            if (error instanceof Error) {
              req.payload.logger.error(
                `Error populating client for user ${user.id}: ${error.message}`,
              )
            } else {
              req.payload.logger.error(
                `Error populating client for user ${user.id}: ${String(error)}`,
              )
            }
          }
        }
        return user // Always return the user
      },
    ],
  },
}
