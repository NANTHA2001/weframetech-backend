// import { Config } from 'payload';

// export const customRoutes = (config: Config): Config => {
//   config.endpoints = [
//     ...(config.endpoints || []),
//     {
//       path: '/book-event',
//       method: 'post',
//       handler: async (req) => {
//         console.log('Booking endpoint hit');
//         const user = req.user;
//         console.log('user:', user);
//         return {
//           status: 200,
//           body: { message: 'Booking received' },
//         };
//       },
//     },
//     {
//       path: '/notify',
//       method: 'post',
//       handler: async (req) => {
//         console.log('Notification endpoint hit');
//         return { status: 200, body: { message: 'Notification received' } };
//       },
//     },
//   ];

//   return config;
// };
