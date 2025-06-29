// D:\Magicbot\Backend\src\collections\AiBots.ts

import { CollectionConfig } from 'payload/types'

const AiBots: CollectionConfig = {
  slug: 'ai_bots',
  admin: {
    // Control who can see and interact with the AiBots collection in the admin UI.
    // Only admins or authenticated client users with a linked client should see this.
    use: ({ req }: { req: import('payload/types').PayloadRequest }) => {
      if (!req.user) {
        return false // Unauthenticated users cannot see AiBots in admin
      }
      if (req.user.role === 'admin') {
        return true // Admins can see all
      }
      // Client users can see if they are authenticated and have a linked client
      return !!req.user.client && req.user.role === 'client'
    },
    defaultColumns: ['bot_name', 'service_type', 'linked_client'],
  },
  access: {
    // Read access:
    // - Admins can read all bots.
    // - Authenticated client users can only read bots linked to THEIR client.
    read: ({ req }: { req: import('payload/types').PayloadRequest }) => {
      // Allow admin users to read all documents
      if (req.user && req.user.role === 'admin') {
        return true
      }
      // Allow client users to read only documents linked to their client
      // The `req.user.client` object should be populated by the Users collection's afterLogin hook.
      if (req.user && req.user.role === 'client' && req.user.client) {
        const userClientId =
          typeof req.user.client === 'object' ? req.user.client.id : req.user.client
        return {
          linked_client: {
            equals: userClientId,
          },
        }
      }
      // Deny access by default if no user, or user doesn't meet criteria
      return false
    },

    // Create access:
    // - Admins can create bots for any client.
    // - Client users can create bots, and it will be automatically linked to their client.
    create: ({ req }: { req: import('payload/types').PayloadRequest }) => {
      if (!req.user) {
        return false // No user, no creation
      }
      if (req.user.role === 'admin') {
        return true
      }
      // Client users can create if they are authenticated and have a linked client
      return !!req.user.client && req.user.role === 'client'
    },

    // Update access:
    // - Admins can update any bot.
    // - Client users can only update bots linked to their own client.
    update: ({ req }: { req: import('payload/types').PayloadRequest }) => {
      if (!req.user) {
        return false // No user, no update
      }
      if (req.user.role === 'admin') {
        return true
      }
      if (req.user.role === 'client' && req.user.client) {
        const userClientId =
          typeof req.user.client === 'object' ? req.user.client.id : req.user.client
        return {
          linked_client: {
            equals: userClientId,
          },
        }
      }
      return false // Deny by default
    },

    // Delete access:
    // - Admins can delete any bot.
    // - Client users can only delete bots linked to their own client.
    delete: ({ req }: { req: import('payload/types').PayloadRequest }) => {
      if (!req.user) {
        return false // No user, no deletion
      }
      if (req.user.role === 'admin') {
        return true
      }
      if (req.user.role === 'client' && req.user.client) {
        const userClientId =
          typeof req.user.client === 'object' ? req.user.client.id : req.user.client
        return {
          linked_client: {
            equals: userClientId,
          },
        }
      }
      return false // Deny by default
    },
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
      relationTo: 'clients', // Links to the 'clients' collection (your tenants)
      hasMany: false, // One bot linked to one client
      label: 'Linked Client',
      required: true, // A bot MUST be linked to a client for multi-tenancy
      admin: {
        // If a client user is logged in, automatically set their client as the linked_client
        // and make it read-only for them. Admins can still choose any client.
        readOnly: ({ req }: { req: import('payload/types').PayloadRequest }) =>
          !!req.user && req.user.role === 'client' && !!req.user.client,
      },
      hooks: {
        beforeChange: [
          // This hook ensures that when a client user creates or updates a bot,
          // the linked_client field is automatically set to their client.
          ({
            req,
            data,
            operation,
          }: {
            req: import('payload/types').PayloadRequest
            data: any
            operation: string
          }) => {
            if (operation === 'create' || operation === 'update') {
              // If the user is an admin, they can explicitly set the linked_client
              if (req.user && req.user.role === 'admin') {
                return data.linked_client
              }
              // If the user is a client and has a linked client, automatically assign it
              if (req.user && req.user.role === 'client' && req.user.client) {
                // Return the client ID from the populated req.user.client
                return typeof req.user.client === 'object' ? req.user.client.id : req.user.client
              }
            }
            // For other operations or if no user/client context, return the existing value
            return data.linked_client
          },
        ],
      },
    },
  ],
}

export default AiBots
