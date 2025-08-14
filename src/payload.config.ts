// payload.config.ts
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig, PayloadRequest } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import Users from './collections/Users'
import Tenants from './collections/Tenants'
import Events from './collections/Events'
import Bookings from './collections/Bookings'
import Notifications from './collections/Notifactions'
import BookingLogs from './collections/Bookinglogs'
import { promoteOldestWaitlisted } from './utils/promotion'
import DashboardView from './admin/pages/dashboard'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        dashboard: {
          Component: './admin/pages/dashboard',
          // exportName: 'default', // matches your default export
        },
      },
    },
  },
  collections: [Users, Tenants, Events, Bookings, Notifications, BookingLogs],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
    },
  }),
  sharp,
  plugins: [payloadCloudPlugin()],
  endpoints: [
    {
      path: '/book-event',
      method: 'post',
      handler: async (req) => {
        const data = await req.json?.()
        // const user = req.user || { id: 1, tenant: 1, role: 'admin' }
        console.log("req", req)
        const user = req.user
        if (!user) throw new Error('Unauthorized')
  
        const { eventId } = data
        if (!eventId) throw new Error('eventId is required')
  
        // Find the event
        const event = await req.payload.findByID({
          collection: 'events',
          id: eventId,
        })
        if (!event) throw new Error('Event not found')
  
        // Tenant IDs
        const userTenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
        const eventTenantId = typeof event.tenant === 'object' ? event.tenant.id : event.tenant
  
        // Cross-tenant check (admins can bypass)
        if (user.role !== 'admin' && userTenantId !== eventTenantId) {
          throw new Error('Cross-tenant access forbidden')
        }
  
        // Count confirmed bookings for this event & tenant
        const confirmed = await req.payload.find({
          collection: 'bookings',
          limit: 0,
          where: {
            and: [
              { event: { equals: eventId } },
              { status: { equals: 'confirmed' } },
              { tenant: { equals: userTenantId } },
            ],
          },
        })
  
        // Determine booking status based on capacity
        const capacity = event.capacity ?? 0
        const status = confirmed.totalDocs < capacity ? 'confirmed' : 'waitlisted'
  
        // Create the booking
        const booking = await req.payload.create({
          collection: 'bookings',
          data: {
            event: eventId,
            user: user.id,
            status,
            tenant: userTenantId,
          },
          depth: 1,
        })
  
        const plainBooking = JSON.parse(JSON.stringify(booking));

        // console.log("booked", plainBooking);
        return Response.json({
          message: plainBooking,
        })

      },
    },
    {
      path: '/cancel-booking',
      method: 'post',
      handler: async (req) => {
        try {
          const data = await req.json?.()
          const user = req.user
          if (!user) throw new Error('Unauthorized')
    
          const { bookingId } = data
          if (!bookingId) throw new Error('bookingId is required')
    
          // Find the booking
          const booking = await req.payload.findByID({
            collection: 'bookings',
            id: bookingId,
          })
          if (!booking) throw new Error('Booking not found')
          // if (booking.status == "canceled") throw new Error('Already canceled')
    
          // Tenant guard
          // const userTenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
          // const eventTenantId = typeof event.tenant === 'object' ? event.tenant.id : event.tenant
          const userTenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
          const bookingTenantId = typeof booking.tenant === 'object' ? booking.tenant.id : booking.tenant
          if (user.role !== 'admin' && userTenantId !== bookingTenantId) {
            throw new Error('Cross-tenant access forbidden')
          }
    
          // Attendee can only cancel their own booking
          if (user.role === 'attendee') {
            const bookingUserId = typeof booking.user === 'object' ? booking.user.id : booking.user
            if (bookingUserId !== user.id) throw new Error('Cannot cancel others’ bookings')
          }
    
          const wasConfirmed = booking.status === 'canceled'
    
          // Update booking status to canceled
          const canceled = await req.payload.update({
            collection: 'bookings',
            id: bookingId,
            user: user.id,
            // tenant: userTenantId,
            data: { status: 'canceled' },
            depth: 1,
          })
    
          let promoted: any = null
          if (wasConfirmed) {
            // Call your utility to promote oldest waitlisted booking
            promoted = await promoteOldestWaitlisted(req as unknown as PayloadRequest, booking.event)
          }
    
          return Response.json({
            canceled: JSON.parse(JSON.stringify(canceled)),
            promoted: promoted ? JSON.parse(JSON.stringify(promoted)) : null,
          })
        } catch (err: any) {
          return Response.json({ error: err.message || 'Server error' }, { status: err.status || 500 })
        }
      }
    },

    {
      path: '/notifications/:id/read',
      method: 'post',
      handler: async (req) => {
        const user = req.user
        if (!user) throw new Error('Unauthorized')
  
        // const data = await req.json(); // if body
        const id = req.query.id as string; 
        const notif = await req.payload.findByID({ collection: 'notifications', id })
        if (!notif) throw new Error('Notification not found')
        const notifTenantId = typeof notif.tenant === 'object' ? notif.tenant.id : notif.tenant
        const notifUserId = typeof notif.user === 'object' ? notif.user.id : notif.user
        if (notifTenantId !== (typeof user.tenant === 'object' ? user.tenant.id : user.tenant) || notifUserId !== user.id) {
          throw new Error('Forbidden')
        }
  
        const updated = await req.payload.update({
          collection: 'notifications',
          id,
          data: { read: true },
        })
  
        return Response.json(JSON.parse(JSON.stringify(updated)))
      },
    },

      // GET /api/my-bookings
    {
      path: '/my-bookings',
      method: 'get',
      handler: async (req) => {
        const user = req.user
        if (!user) throw new Error('Unauthorized')

        const data = await req.payload.find({
          collection: 'bookings',
          where: {
            and: [
              { tenant: { equals: typeof user.tenant === 'object' ? user.tenant.id : user.tenant } },
              { user: { equals: typeof user.id === 'object' ? user.id : user.id } },
            ]
          },
          sort: '-createdAt',
        })
        return Response.json(JSON.parse(JSON.stringify(data)))
      },
    },

    // GET /api/my-notifications
    {
      path: '/my-notifications',
      method: 'get',
      handler: async (req) => {
        const user = req.user
        if (!user) throw new Error('Unauthorized')

        const where: any = {
          and: [
            { tenant: { equals: typeof user.tenant === 'object' ? user.tenant.id : user.tenant } },
            { user: { equals: typeof user.id === 'object' ? user.id : user.id } },
          ]
        }
        if (req.query.unread === 'true') where.and.push({ read: { equals: false } })

        const data = await req.payload.find({
          collection: 'notifications',
          where,
          sort: '-createdAt',
        })
        return Response.json(JSON.parse(JSON.stringify(data)))
      },
    },
   
    {
      path: '/dashboard',
      method: 'get',
      handler: async (req) => {
        const user = req.user;
        if (!user) throw new Error('Unauthorized');
        if (!['organizer', 'admin'].includes(user.role)) throw new Error('Forbidden');
    
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant;
        const nowISO = new Date().toISOString();
    
        // Upcoming events
        const events = await req.payload.find({
          collection: 'events',
          where: {
            and: [
              { tenant: { equals: tenantId } },
              { date: { greater_than_equal: nowISO } },
            ]
          },
          limit: 50,
          sort: 'date',
        });
    
        // Count bookings per status
        const eventsWithCounts = await Promise.all(events.docs.map(async (ev: any) => {
          const [confirmed, waitlisted, canceled] = await Promise.all([
            req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ event: { equals: ev.id } }, { status: { equals: 'confirmed' } }, { tenant: { equals: tenantId } }] } }),
            req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ event: { equals: ev.id } }, { status: { equals: 'waitlisted' } }, { tenant: { equals: tenantId } }] } }),
            req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ event: { equals: ev.id } }, { status: { equals: 'canceled' } }, { tenant: { equals: tenantId } }] } }),
          ]);
    
          const confirmedCount = confirmed.totalDocs;
          const waitlistedCount = waitlisted.totalDocs;
          const canceledCount = canceled.totalDocs;
          // const percentageFilled = ev.capacity > 0 ? Math.round((confirmedCount / ev.capacity) * 100) : 0;
          const percentageFilled = ev.capacity > 0 
          ? Math.min(Math.round((confirmedCount / ev.capacity) * 100), 100)
          : 0;

    
          return { id: ev.id, title: ev.title, date: ev.date, capacity: ev.capacity, confirmedCount, waitlistedCount, canceledCount, percentageFilled };
        }));
    
        // Summary analytics
        const [totalEvents, totalConfirmed, totalWaitlisted, totalCanceled] = await Promise.all([
          events.totalDocs,
          req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ tenant: { equals: tenantId } }, { status: { equals: 'confirmed' } }] } }).then(r => r.totalDocs),
          req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ tenant: { equals: tenantId } }, { status: { equals: 'waitlisted' } }] } }).then(r => r.totalDocs),
          req.payload.find({ collection: 'bookings', limit: 0, where: { and: [{ tenant: { equals: tenantId } }, { status: { equals: 'canceled' } }] } }).then(r => r.totalDocs),
        ]);
    
        // Recent logs
        const recent = await req.payload.find({
          collection: 'booking-logs',
          where: { tenant: { equals: tenantId } },
          sort: '-createdAt',
          limit: 5,
        });
    
        return Response.json({
          upcomingEvents: eventsWithCounts,
          summary: { totalEvents, totalConfirmed, totalWaitlisted, totalCanceled },
          recentActivity: recent.docs,
        });
      },
    },
    

 
    
  ],
  onInit: async (payload) => {
    const existingAdmins = await payload.find({
      collection: 'users',
      where: { role: { equals: 'admin' } },
    })

    if (!existingAdmins.totalDocs) {
      // Replace 'yourTenantIdHere' with an actual tenant ID
      await payload.create({
        collection: 'users',
        data: {
          name: 'Super Admin',
          email: 'nanthakumarg2001@gmail.com',
          password: 'GNanthu$2001', // Payload will hash this automatically
          role: 'admin',
          tenant: 1,
        },
      })
      console.log('Initial admin user created: admin@example.com / Admin@123')
    }
  },
})
