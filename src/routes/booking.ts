// import type { Express, Request, Response } from 'express';
// import { requireUser, tenantWhere } from '../access/tenant';
// import { isAttendee } from '../access/role';
// import { promoteOldestWaitlisted } from '../utils/promotion';
// import { PayloadRequest } from 'payload';

// export default function bookingRoutes(app: Express) {

//   // POST /api/book-event  { eventId }
//   app.post('/api/book-events', async (req: Request, res: Response) => {
//     // console.log("hiii")
//     try {
//       requireUser(req);
//       const user = req.user;
//       console.log("req", req)

//       // Attendees can only book for themselves
//       if (!isAttendee(user) && user.role !== 'organizer' && user.role !== 'admin') {
//         return res.status(403).json({ error: 'Forbidden' });
//       }

//       const { eventId } = req.body;
//       if (!eventId) return res.status(400).json({ error: 'eventId required' });

//       // Verify event in same tenant & fetch capacity
//       const ev = await req.payload.findByID({ collection: 'events', id: eventId });
//       if (ev.tenant !== user.tenant) return res.status(403).json({ error: 'Cross-tenant access forbidden' });

//       // Count confirmed bookings
//       const confirmed = await req.payload.find({
//         collection: 'bookings',
//         limit: 0,
//         where: {
//           and: [
//             { event: { equals: eventId } },
//             { status: { equals: 'confirmed' } },
//             { tenant: { equals: user.tenant } },
//           ]
//         }
//       });

//       const capacity = ev.capacity ?? 0;
//       const status = confirmed.totalDocs < capacity ? 'confirmed' : 'waitlisted';

//       const booking = await req.payload.create({
//         collection: 'bookings',
//         data: {
//           event: eventId,
//           user: user.id,
//           status,
//           tenant: user.tenant,
//         },
//       });

//       return res.json({ booking });
//     } catch (e: any) {
//       return res.status(e.status || 500).json({ error: e.message || 'Server error' });
//     }
//   });

//   // POST /api/cancel-booking  { bookingId }
//   app.post('/api/cancel-booking', async (req: Request, res: Response) => {
//     try {
//       requireUser(req);
//       const user = req.user;
//       const { bookingId } = req.body;
//       if (!bookingId) return res.status(400).json({ error: 'bookingId required' });

//       const booking = await req.payload.findByID({ collection: 'bookings', id: bookingId });
//       // Tenant guard
//       if (booking.tenant !== user.tenant) return res.status(403).json({ error: 'Cross-tenant access forbidden' });

//       // Attendee can only cancel their own booking
//       if (user.role === 'attendee' && booking.user !== user.id) {
//         return res.status(403).json({ error: 'Cannot cancel others’ bookings' });
//       }

//       // Update to canceled (idempotent-ish)
//       const wasConfirmed = booking.status === 'confirmed';
//       const canceled = await req.payload.update({
//         collection: 'bookings',
//         id: bookingId,
//         data: { status: 'canceled' },
//       });

//       let promoted: any = null;
//       if (wasConfirmed) {
//         // Promote oldest waitlisted
//         promoted = await promoteOldestWaitlisted(req as unknown as PayloadRequest, booking.event);
//       }

//       return res.json({ canceled, promoted });
//     } catch (e: any) {
//       return res.status(e.status || 500).json({ error: e.message || 'Server error' });
//     }
//   });

//   // GET /api/my-bookings
//   app.get('/api/my-bookings', async (req: Request, res: Response) => {
//     try {
//       requireUser(req);
//       const data = await req.payload.find({
//         collection: 'bookings',
//         where: {
//           and: [
//             { tenant: { equals: req.user.tenant } },
//             { user: { equals: req.user.id } },
//           ]
//         },
//         sort: '-createdAt'
//       });
//       res.json(data);
//     } catch (e: any) {
//       res.status(e.status || 500).json({ error: e.message });
//     }
//   });

//   // GET /api/my-notifications?unread=true
//   app.get('/api/my-notifications', async (req: Request, res: Response) => {
//     try {
//       requireUser(req);
//       const where: any = {
//         and: [
//           { tenant: { equals: req.user.tenant } },
//           { user: { equals: req.user.id } },
//         ]
//       };
//       if (req.query.unread === 'true') where.and.push({ read: { equals: false } });

//       const data = await req.payload.find({ collection: 'notifications', where, sort: '-createdAt' });
//       res.json(data);
//     } catch (e: any) {
//       res.status(e.status || 500).json({ error: e.message });
//     }
//   });

//   // POST /api/notifications/:id/read
//   app.post('/api/notifications/:id/read', async (req: Request, res: Response) => {
//     try {
//       requireUser(req);
//       const id = req.params.id;
//       const notif = await req.payload.findByID({ collection: 'notifications', id });
//       if (notif.tenant !== req.user.tenant || notif.user !== req.user.id) {
//         return res.status(403).json({ error: 'Forbidden' });
//       }
//       const updated = await req.payload.update({
//         collection: 'notifications',
//         id,
//         data: { read: true },
//       });
//       res.json(updated);
//     } catch (e: any) {
//       res.status(e.status || 500).json({ error: e.message });
//     }
//   });

// }
