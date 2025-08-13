import { CollectionConfig } from 'payload';
import { tenantWhere } from '../access/tenant';
import { createNotificationForStatus } from '../utils/notifications';
import { writeBookingLog } from '../utils/logs';

const Bookings: CollectionConfig = {
  slug: 'bookings',
  fields: [
    { name: 'event', type: 'relationship', relationTo: 'events', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'status', type: 'select', required: true, options: ['confirmed','waitlisted','canceled'], defaultValue: 'waitlisted' },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, admin: { position: 'sidebar' } },
  ],
  access: {
    read: ({ req }) => tenantWhere(req),
    create: ({ req }) => tenantWhere(req),
    update: ({ req }) => tenantWhere(req),
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
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        // auto notifications + logs for any status change
        if (operation === 'create') {
          const action = doc.status === 'confirmed' ? 'auto_confirm' : doc.status === 'waitlisted' ? 'auto_waitlist' : 'create_request';
         
          await createNotificationForStatus(req, doc);
          await writeBookingLog(req, doc);
        } else if (operation === 'update' && previousDoc?.status !== doc.status) {
          let action: any = null;
          if (doc.status === 'canceled' && previousDoc.status === 'confirmed') action = 'cancel_confirmed';
          else if (doc.status === 'confirmed' && previousDoc.status === 'waitlisted') action = 'promote_from_waitlist';

          await createNotificationForStatus(req, doc);
          await writeBookingLog(req, doc);
      
        }
      },
    ],
  },
};
export default Bookings;
