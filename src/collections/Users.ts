// D:\Magicbot\Backend\src\collections\Users.ts

import type { CollectionConfig, PayloadRequest, User } from 'payload/types'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }: { user?: { role?: string } }) => !user || user.role !== 'admin',
    defaultColumns: ['email', 'role', 'client'],
  },
  auth: true,
  access: {
    read: ({ req }: { req: PayloadRequest }) => {
      if (req.user && req.user.role === 'admin') {
        return true
      }
      if (req.user && req.user.role === 'client' && req.user.client) {
        const userClientId =
          typeof req.user.client === 'object' ? req.user.client.id : req.user.client
        return {
          or: [{ id: { equals: req.user.id } }, { client: { equals: userClientId } }],
        }
      }
      return false // Deny access by default if no user or no matching role/client
    },
    create: ({ req }: { req: PayloadRequest }) => {
      // Only admins can create users. If req.user is undefined, it's not an admin.
      return !!req.user && req.user.role === 'admin'
    },
    update: ({ req, data }: { req: PayloadRequest; data: { id?: string | number } }) => {
      // First, check if req.user exists at all
      if (!req.user) {
        return false // No user logged in, cannot update
      }

      // If user is an admin, allow update
      if (req.user.role === 'admin') {
        return true
      }

      // If user is a client, allow update ONLY if they are updating their own record
      if (req.user.role === 'client') {
        return String(req.user.id) === String(data.id)
      }

      // Deny by default for any other role or unhandled case
      return false
    },
    delete: ({ req }: { req: PayloadRequest }) => {
      // Only admins can delete users. If req.user is undefined, it's not an admin.
      return !!req.user && req.user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Client', value: 'client' },
      ],
      defaultValue: 'client',
      required: true,
      admin: {
        readOnly: ({ req }: { req: PayloadRequest }) => !req.user || req.user.role !== 'admin', // Added !req.user check
      },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: false,
      hasMany: false,
      admin: {
        readOnly: ({ req }: { req: PayloadRequest }) =>
          !req.user || (req.user && req.user.role === 'client'), // Added !req.user check
      },
      hooks: {
        beforeChange: [
          ({ req, data }: { req: PayloadRequest; data: Record<string, unknown> }) => {
            if (req.user && req.user.role === 'client' && req.user.client) {
              return typeof req.user.client === 'object' ? req.user.client.id : req.user.client
            }
            return data.client
          },
        ],
      },
    },
  ],
  hooks: {
    afterLogin: [
      async ({ req, user }: { req: PayloadRequest; user: User }) => {
        if (user && user.client && typeof user.client === 'string') {
          try {
            const client = await req.payload.findByID({
              collection: 'clients',
              id: user.client,
              depth: 0,
            })
            if (client && req.user) {
              req.user.client = {
                id: client.id,
                name: client.name as string,
              }
            }
          } catch (error: unknown) {
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
        return user
      },
    ],
  },
}
