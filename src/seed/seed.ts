import payload from 'payload';

import config from '../payload.config'; // CommonJS style works

const seed = async () => {
  await payload.init({ config });

  const tenant = await payload.create({
    collection: 'tenants',
    data: { name: 'Acme Org' },
  });

  const organizer = await payload.create({
    collection: 'users',
    data: {
      name: 'Olivia Organizer',
      email: 'org@acme.io',
      role: 'organizer',
      tenant: tenant.id,
      password: 'Password123!',
    },
  });

  const attendee = await payload.create({
    collection: 'users',
    data: {
      name: 'Andy Attendee',
      email: 'user@acme.io',
      role: 'attendee',
      tenant: tenant.id,
      password: 'Password123!',
    },
  });

  const event = await payload.create({
    collection: 'events',
    data: {
      title: 'Launch Party',
      description: {
        root: {
            type: 'root',
            children: [{
                type: 'paragraph', children: [{ type: 'text', text: 'Welcome!' }],
                version: 0
            }],
            direction: null,
            format: '',
            indent: 0,
            version: 0
        },
      },
      date: new Date(Date.now() + 86400000).toISOString(),
      capacity: 2,
      organizer: organizer.id,
      tenant: tenant.id,
    },
  });

  console.log({ tenant: tenant.id, event: event.id, organizer: organizer.email, attendee: attendee.email });
};

seed()
  .then(() => console.log('Seeding complete ✅'))
  .catch(err => console.error('Seeding failed ❌', err));
