import { CollectionConfig } from 'payload/types'

const AiTeamMembers: CollectionConfig = {
  slug: 'ai_team_members',
  admin: {
    description: 'AI team members',
    defaultColumns: ['name', 'role', 'active'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'role',
      type: 'text',
      label: 'Role',
    },
    {
      name: 'skills',
      type: 'json', // Use 'json' for arbitrary JSON data
      label: 'Skills (JSON)',
      admin: {
        description: 'Store skills as a JSON array or object (e.g., ["Python", "NLP"])',
      },
    },
    {
      name: 'active',
      type: 'checkbox', // Boolean becomes 'checkbox'
      defaultValue: true, // Default value as per Directus
      label: 'Active',
    },
  ],
}

export default AiTeamMembers
