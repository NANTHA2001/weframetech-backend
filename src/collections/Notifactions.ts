import { CollectionConfig } from 'payload';
import { tenantWhere } from '../access/tenant';

const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'booking', type: 'number' },
    { name: 'type', type: 'select', required: true,
      options: ['booking_confirmed','waitlisted','waitlist_promoted','booking_canceled'] },
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'textarea' },
    { name: 'read', type: 'checkbox', defaultValue: false },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, admin: { position: 'sidebar' } },
  ],
  access: {
    read: ({ req }) => ({
      and: [ tenantWhere(req), { user: { equals: req?.user?.id } } ]
    }),
    create: ({ req }) => tenantWhere(req),
    update: ({ req }) => ({
      and: [ tenantWhere(req), { user: { equals: req?.user?.id } } ]
    }),
    delete: ({ req }) => false,
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
export default Notifications;
