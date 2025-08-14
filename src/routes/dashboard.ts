// import type { Express, Request, Response } from 'express';
// import { requireUser } from '../access/tenant';

// export default function dashboardRoutes(app: Express) {

//   // GET /api/dashboard  (organizer/admin only)
//   app.get('/api/dashboard', async (req: Request, res: Response) => {
//     try {
//       requireUser(req);
//       const user = req.user;
//       if (!['organizer','admin'].includes(user.role)) {
//         return res.status(403).json({ error: 'Forbidden' });
//       }

//       const nowISO = new Date().toISOString();

//       // Upcoming events for tenant
//       const events = await req.payload.find({
//         collection: 'events',
//         where: {
//           and: [
//             { tenant: { equals: user.tenant } },
//             { date: { greater_than_equal: nowISO } },
//           ]
//         },
//         limit: 50,
//         sort: 'date',
//       });

//       // For each event, compute counts
//       const eventsWithCounts = await Promise.all(events.docs.map(async (ev: any) => {
//         const [confirmed, waitlisted, canceled] = await Promise.all([
//           req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ event: { equals: ev.id } }, { status: { equals: 'confirmed' } }, { tenant: { equals: user.tenant } }] } }),
//           req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ event: { equals: ev.id } }, { status: { equals: 'waitlisted' } }, { tenant: { equals: user.tenant } }] } }),
//           req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ event: { equals: ev.id } }, { status: { equals: 'canceled' } }, { tenant: { equals: user.tenant } }] } }),
//         ]);

//         const confirmedCount = confirmed.totalDocs;
//         const waitlistedCount = waitlisted.totalDocs;
//         const canceledCount = canceled.totalDocs;
//         const percentageFilled = ev.capacity > 0 ? Math.round((confirmedCount / ev.capacity) * 100) : 0;

//         return { id: ev.id, title: ev.title, date: ev.date, capacity: ev.capacity, confirmedCount, waitlistedCount, canceledCount, percentageFilled };
//       }));

//       // Summary analytics
//       const [totalEvents, totalConfirmed, totalWaitlisted, totalCanceled] = await Promise.all([
//         events.totalDocs,
//         req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ tenant: { equals: user.tenant } }, { status: { equals: 'confirmed' } }] } }).then((r: { totalDocs: any; }) => r.totalDocs),
//         req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ tenant: { equals: user.tenant } }, { status: { equals: 'waitlisted' } }] } }).then((r: { totalDocs: any; }) => r.totalDocs),
//         req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ tenant: { equals: user.tenant } }, { status: { equals: 'canceled' } }] } }).then((r: { totalDocs: any; }) => r.totalDocs),
//       ]);

//       // Recent activity (last 5 logs)
//       const recent = await req.payload.find({
//         collection: 'booking-logs',
//         where: { tenant: { equals: user.tenant } },
//         sort: '-createdAt',
//         limit: 5,
//       });

//       res.json({
//         upcomingEvents: eventsWithCounts,
//         summary: { totalEvents, totalConfirmed, totalWaitlisted, totalCanceled },
//         recentActivity: recent.docs,
//       });
//     } catch (e: any) {
//       res.status(e.status || 500).json({ error: e.message });
//     }
//   });

// }
