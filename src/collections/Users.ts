import { CollectionConfig } from 'payload';

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true }, 
    { name: 'password', type: 'text', required: true },
    { name: 'role', type: 'select', required: true, options: ['attendee','organizer','admin'], defaultValue: 'attendee' },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, admin: { position: 'sidebar' } },
  ],
  access: {
    read: ({ req }) => ({ tenant: { equals: req?.user?.tenant } }),
    create: ({ req }) => req.user && ['organizer','admin'].includes(req.user.role) ? true : false,
    update: ({ req }) => ({ tenant: { equals: req?.user?.tenant } }),
    delete: ({ req }) => req.user?.role === 'admin',
  },
};

export default Users;
