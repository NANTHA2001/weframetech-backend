import type { User, Payload } from '../models/model'; // <-- adjust path to your actual User type


declare global {
  namespace Express {
    interface Request {
      user?: User;
      payload: Payload;
    }
  }
}

export {};
