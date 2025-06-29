import type { CollectionConfig, PayloadRequest, User } from 'payload/types'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }: { user?: { role?: string } }) => !user || user.role !== 'admin',
    defaultColumns: ['email', 'role', 'client'],
  },
  access: {
    // Admin can read all, clients can read their own or users tied to their client
    read: ({ req }: { req: PayloadRequest }) => {
      if (req.user?.role === 'admin') return true

      if (req.user?.role === 'client' && req.user.client) {
        const userClientId =
          typeof req.user.client === 'object' ? req.user.client.id : req.user.client

        return {
          or: [{ id: { equals: req.user.id } }, { client: { equals: userClientId } }],
        }
      }

      return false
    },

    // Admin can update all, clients can only update themselves
    update: ({ req, data }: { req: PayloadRequest; data: { id?: string } }) => {
      if (req.user?.role === 'admin') return true
      if (req.user?.role === 'client' && data?.id) {
        return String(req.user.id) === String(data.id)
      }
      return false
    },

    // Only admin can delete users
    delete: ({ req }: { req: PayloadRequest }) => {
      return req.user?.role === 'admin'
    },

    // Only admin can create new users
    create: ({ req }: { req: PayloadRequest }) => {
      return req.user?.role === 'admin'
    },
  },

  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'client',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Client', value: 'client' },
      ],
      admin: {
        readOnly: ({ req }: { req: PayloadRequest }) => req.user?.role !== 'admin',
      },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: false,
      hasMany: false,
      admin: {
        readOnly: ({ req }: { req: PayloadRequest }) => !req.user || req.user.role === 'client',
      },
      hooks: {
        beforeChange: [
          ({ req, data }: { req: PayloadRequest; data: Record<string, unknown> }) => {
            if (req.user?.role === 'client' && req.user.client) {
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
        if (user?.client && typeof user.client === 'string') {
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
          } catch (error) {
            req.payload.logger.error(
              `Error populating client for user ${user.id}: ${error instanceof Error ? error.message : String(error)}`,
            )
          }
        }
        return user
      },
    ],

    beforeChange: [
      ({ req, data }) => {
        // Ensure role stays 'client' for non-admins
        if (req.user?.role !== 'admin') {
          data.role = 'client'
        }
        return data
      },
    ],
  },
}
