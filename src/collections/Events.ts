import { CollectionConfig } from 'payload';
import { tenantWhere } from '../access/tenant';

const Events: CollectionConfig = {
  slug: 'events',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'richText' },
    { name: 'date', type: 'date', required: true },
    { name: 'capacity', type: 'number', required: true, min: 1 },
    { name: 'organizer', type: 'relationship', relationTo: 'users', required: true },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, admin: { position: 'sidebar' } },
  ],
  access: {
    read: ({ req }) => tenantWhere(req),
    create: ({ req }) => req.user && ['organizer','admin'].includes(req.user.role) ? true : false,
    update: ({ req }) => tenantWhere(req),
    delete: ({ req }) => req.user?.role === 'admin' ? tenantWhere(req) : false,
  },
  hooks: {
    beforeValidate: [
        ({ data, req }) => {
          if (data && req.user?.tenant && !data.tenant) {
            data.tenant = req.user.tenant;
          }
          return data;
        },
      ],      
  },
};
export default Events;
