import { PayloadRequest } from 'payload';

const allowedActions = [
  'create_request',
  'waitlisted',
  'confirmed',
  'promote_from_waitlist',
  'cancel_confirmed'
] as const;

type BookingAction = (typeof allowedActions)[number];

export async function writeBookingLog(
  req: PayloadRequest,
  bookingDoc: any,
  action?: BookingAction
) {
  const tenantField = bookingDoc.tenant?.id || bookingDoc.user?.tenant?.id;
  if (!tenantField) {
    throw new Error('Tenant is required to write booking log');
  }

  const finalAction: BookingAction = allowedActions.includes(bookingDoc.action)
    ? bookingDoc.action
    : action
      ? action
      : bookingDoc._promoted
        ? 'promote_from_waitlist'
        : bookingDoc.status === 'confirmed'
          ? 'confirmed'
          : bookingDoc.status === 'waitlisted'
            ? 'waitlisted'
            : bookingDoc.status === 'canceled'
              ? 'cancel_confirmed'
              : 'create_request';


  await req.payload.create({
    collection: 'booking-logs',
    data: {
      event: bookingDoc.event?.id,
      note: bookingDoc.note,
      tenant: tenantField,
      user: bookingDoc.user?.id,
      action: finalAction,
      booking: bookingDoc.id,
    },
    overrideAccess: true,
    depth: 0,
  });
}
