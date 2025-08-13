import { CollectionConfig } from 'payload';

const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
  ],
  access: {
    // Only admins can read their own tenant doc from the admin UI; API queries are usually internal
    read: ({ req }) => ({ id: { equals: req?.user?.tenant } }),
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => ({ id: { equals: req?.user?.tenant } }),
    delete: () => false,
  },
};
export default Tenants;
