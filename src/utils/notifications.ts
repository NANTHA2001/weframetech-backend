import type { PayloadRequest } from 'payload';

import { BookingAction, bookingActionToNotificationType, notificationTitleMap } from '../models/booking';

export async function createNotificationForStatus(req: PayloadRequest, bookingDoc: any, action?: BookingAction) {
  
  const type = bookingActionToNotificationType[bookingDoc.status] ?? 'waitlisted';

  const promoted = bookingDoc._promoted === true;
  const finalType = promoted ? 'waitlist_promoted' : type;

  if (!bookingDoc.id) throw new Error('Booking must exist before creating notification');


    const userField = typeof bookingDoc.user === 'object'
    ? bookingDoc.user.id
    : bookingDoc.user;

    const tenantField = bookingDoc.tenant?.id || bookingDoc.user?.tenant?.id;

    if (!userField || !tenantField) throw new Error('User and Tenant must exist');


  await req.payload.create({
    collection: 'notifications',
    data: {
        booking: bookingDoc.id,
        tenant: bookingDoc.tenant?.id || bookingDoc.user?.tenant?.id,
        user: bookingDoc.user?.id,
        action: finalType,
        type: action || finalType,
        title: notificationTitleMap[finalType],
        message: promoted
        ? 'A spot opened up and your booking is now confirmed.'
        : finalType === 'booking_confirmed'
          ? 'Your booking is confirmed.'
          : finalType === 'waitlisted'
            ? 'Event is full. You have been added to the waitlist.'
            : 'Your booking was canceled.',
    } as any,
    overrideAccess: true,
    depth: 0,
  });
}

