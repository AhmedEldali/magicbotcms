// src/payload-custom-types.d.ts

// Extend the User interface provided by Payload CMS
declare module 'payload' {
  export interface User {
    // Define the possible roles for your users.
    // Ensure these match the 'value' properties in your 'role' select field options.
    role?: 'admin' | 'client'

    // Define the structure of the 'client' relationship on the User.
    // It can be either the ID of the client (string) or a fully populated object
    // with properties like id, name, and optionally slug.
    client?:
      | {
          id: string
          name: string // Assuming your 'clients' collection has a 'name' field
          slug?: string // Optional: include if your 'clients' collection has a 'slug' field
        }
      | string
  }

  // You might also need to extend PayloadRequest if you add other custom properties
  // directly to `req` that are not on `req.user`. For now, just augmenting `User` is enough
  // to cover `req.user.role` and `req.user.client`.
}
