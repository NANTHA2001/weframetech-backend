import { CollectionConfig } from 'payload';
import { tenantWhere } from '../access/tenant';

const BookingLogs: CollectionConfig = {
  slug: 'booking-logs',
  admin: { useAsTitle: 'action' },
  fields: [
    // { name: 'booking', type: 'number'},
    { name: 'event', type: 'relationship', relationTo: 'events' as const, required: true },
    { name: 'user', type: 'relationship', relationTo: 'users' as const, required: true },
    { name: 'action', type: 'select', required: true,
      options: [
        'create_request',
        'waitlisted',
        'confirmed',
        'promote_from_waitlist',
        'cancel_confirmed'
      ]
    },
    { name: 'note', type: 'text' },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants' as const, required: true, admin: { position: 'sidebar' } },
  ],
  access: {
    read: ({ req }) => tenantWhere(req),
    create: ({ req }) => tenantWhere(req),
    update: () => false,
    delete: () => false,
  },
  hooks: {
    beforeValidate: [
      ({ data = {}, req }) => {
        if ((req.user as any)?.tenant && !data.tenant) {
          data.tenant = (req.user as any).tenant;
        }
        return data;
      },
    ],
  },
};

export default BookingLogs;
