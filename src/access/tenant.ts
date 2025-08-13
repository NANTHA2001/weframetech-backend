import { PayloadRequest, Where } from "payload";

// Ensures all queries are scoped to the user's tenant
export const tenantWhere = (req: PayloadRequest): Where => {
    if (!req.user?.tenant) {
      // match nothing
      return { id: { equals: null } };
    }
    return { tenant: { equals: req.user.tenant } };
  };
  
  
  // Quick guard
  import type { Request } from 'express';
  import type { User } from '../models/user';
  
  type RequireUserFn = (req: Request) => asserts req is Request & { user: User };
  
  export const requireUser: RequireUserFn = (req) => {
    if (!req.user) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
  };
  