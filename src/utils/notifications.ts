import type { PayloadRequest } from 'payload';

export async function createNotificationForStatus(req: PayloadRequest, bookingDoc: any) {
  
    const typeMap: any = {
    confirmed: 'booking_confirmed',
    waitlisted: 'waitlisted',
    canceled: 'booking_canceled',
  };

  const type = typeMap[bookingDoc.status] ?? 'waitlisted';

  const titleMap: any = {
    booking_confirmed: 'Booking Confirmed',
    waitlisted: 'Added to Waitlist',
    booking_canceled: 'Booking Canceled',
    waitlist_promoted: 'Promoted from Waitlist',
  };

  const promoted = bookingDoc._promoted === true;
  const finalType = promoted ? 'waitlist_promoted' : type;

  // Make sure booking exists
  if (!bookingDoc.id) throw new Error('Booking must exist before creating notification');

  // Ensure valid IDs for relationships
    const userField = typeof bookingDoc.user === 'object'
    ? bookingDoc.user.id
    : bookingDoc.user;

    const tenantField = bookingDoc.tenant?.id || bookingDoc.user?.tenant?.id;

    if (!userField || !tenantField) throw new Error('User and Tenant must exist');


  await req.payload.create({
    collection: 'notifications',
    data: {
        // booking: bookingDoc.id, // <-- make sure you use doc.id directly
        tenant: bookingDoc.tenant?.id || bookingDoc.user?.tenant?.id,
        user: bookingDoc.user?.id,
        type: finalType,
        title: titleMap[finalType],
        message: promoted
        ? 'A spot opened up and your booking is now confirmed.'
        : finalType === 'booking_confirmed'
          ? 'Your booking is confirmed.'
          : finalType === 'waitlisted'
            ? 'Event is full. You have been added to the waitlist.'
            : 'Your booking was canceled.',
    },
    overrideAccess: true,
    depth: 0,
    // transactionID: req.transactionID 
  });
}



// const type = typeMap[bookingDoc.status] ?? 'waitlisted';