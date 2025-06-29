// D:\Magicbot\Backend\src\collections\Tenants.ts

import { CollectionConfig } from 'payload/types' // Corrected import path for CollectionConfig

// Extend the Payload User type for better type safety
// This is important so TypeScript knows about `req.user.role` and `req.user.tenant`
// To avoid duplicate identifier errors, move this module augmentation to a separate .d.ts file (e.g., payload-user.d.ts) at your project's root or src/types directory.

const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    // The admin object controls how this collection appears in the admin UI.
    defaultColumns: ['name', 'slug'],
    enableRichTextRelationship: false, // Optional: prevent linking tenants in rich text if not desired
  },
  access: {
    // Access control for read, create, update, delete operations via API or GraphQL

    // READ access:
    // - Admins can read all tenants.
    // - Authenticated users with a 'tenantUser' role can read *their own* tenant data.
    // - Public (unauthenticated) users cannot read tenants.
    read: ({ req }) => {
      // Allow admin users to read all tenants
      if (req.user && req.user.role === 'admin') {
        return true
      }
      // Allow tenant users to read their own tenant data
      if (req.user && req.user.role === 'tenantUser' && req.user.tenant) {
        // If the user's tenant is a populated object, use its ID.
        // If it's just an ID string, use that directly.
        const userTenantId =
          typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          id: {
            equals: userTenantId, // Only read the tenant that matches the user's linked tenant
          },
        }
      }
      // Deny access by default for all other cases (unauthenticated, wrong role, no linked tenant)
      return false
    },

    // CREATE access: Only admin users can create new tenants.
    create: ({ req }) => {
      return !!req.user && req.user.role === 'admin'
    },

    // UPDATE access: Only admin users can update tenants.
    update: ({ req }) => {
      return !!req.user && req.user.role === 'admin'
    },

    // DELETE access: Only admin users can delete tenants.
    delete: ({ req }) => {
      return !!req.user && req.user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      label: 'Tenant Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Tenant Slug (for URLs/identification)',
      admin: {
        position: 'sidebar', // Position in the admin UI
      },
      hooks: {
        beforeValidate: [
          // Automatically convert name to a slug if no slug is provided or it's empty
          ({ value, data }) => {
            if (value) {
              return value
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
            }
            if (data?.name) {
              return (data.name as string)
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
            }
            return value
          },
        ],
      },
    },
    // You can add more fields here relevant to a tenant, e.g.:
    // {
    //   name: 'stripeCustomerId',
    //   type: 'text',
    //   label: 'Stripe Customer ID',
    //   admin: { readOnly: true },
    // },
    // {
    //   name: 'subscriptionStatus',
    //   type: 'select',
    //   options: ['active', 'trial', 'inactive'],
    //   defaultValue: 'trial',
    // },
  ],
}

export default Tenants
