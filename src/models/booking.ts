// src/models/booking.ts

export const ALLOWED_BOOKING_ACTIONS = [
  'create_request',
  'waitlisted',
  'confirmed',
  'promote_from_waitlist',
  'cancel_confirmed',
  'canceled',
  'waitlist_promoted', 
] as const;

export type BookingAction = typeof ALLOWED_BOOKING_ACTIONS[number];

export const bookingActionToNotificationType: Record<string, string> = {
  confirmed: 'booking_confirmed',
  waitlisted: 'waitlisted',
  canceled: 'booking_canceled'
};

export const notificationTitleMap: Record<string, string> = {
  booking_confirmed: 'Booking Confirmed',
  waitlisted: 'Added to Waitlist',
  booking_canceled: 'Booking Canceled',
  waitlist_promoted: 'Promoted from Waitlist',
};
