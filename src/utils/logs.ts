import { PayloadRequest } from "payload";

// inside writeBookingLog.ts or wherever the function is
type BookingAction = 
  | 'create_request'
  | 'auto_waitlist'
  | 'auto_confirm'
  | 'promote_from_waitlist'
  | 'cancel_confirmed';

export async function writeBookingLog(
  req: PayloadRequest,
  bookingDoc: any,  
) {
  const tenantField = bookingDoc.tenant?.id || bookingDoc.user?.tenant?.id;
  if (!tenantField) {
    throw new Error('Tenant is required to write booking log');
  }
//   console.log("doc", bookingDoc)
  await req.payload.create({
    collection: 'booking-logs',
    data: {
      event: bookingDoc.event?.id,
      note: bookingDoc.note,
      tenant: bookingDoc.tenant?.id || bookingDoc.user?.tenant?.id,
      user: bookingDoc.user?.id,
      action: bookingDoc.status,
    //   booking: data.booking,
    },
  });
}

// tenant: bookingDoc.tenant?.id || bookingDoc.user?.tenant?.id,
// user: bookingDoc.user?.id,
// type: finalType,
// title: titleMap[finalType],
// message: promoted