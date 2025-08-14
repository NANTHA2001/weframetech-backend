import type { PayloadRequest } from 'payload';
import { createNotificationForStatus } from './notifications';
import { writeBookingLog } from './logs';

export async function promoteOldestWaitlisted(req: PayloadRequest, eventId: string | any) {
  console.log("event", eventId);

  const eventIdValue = typeof eventId === 'object' ? eventId.id : eventId;

  const tenantId = typeof req.user?.tenant === 'object' 
    ? req.user.tenant.id 
    : req.user?.tenant;

  const wl = await req.payload.find({
    collection: 'bookings',
    limit: 1,
    sort: 'createdAt', 
    where: {
      and: [
        { event: { equals: eventIdValue } },
        { status: { equals: 'waitlisted' } },
        { tenant: { equals: tenantId} },
      ],
    },
  });

  const candidate = wl.docs[0];
  if (!candidate) return null;

  const updated = await req.payload.update({
    collection: 'bookings',
    id: candidate.id,
    data: { status: 'confirmed', _promoted: true } as any, 
  });


  await createNotificationForStatus(req, updated);


  await writeBookingLog(req, updated);

  console.log("promoteddd", updated);
  return updated;
}
