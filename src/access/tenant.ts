import { PayloadRequest, Where } from "payload";

export const tenantWhere = (req: PayloadRequest): Where => {
    if (!req.user?.tenant) {
      return { id: { equals: null } };
    }
    return { tenant: { equals: req.user.tenant } };
  };
  
  
  // Quick guard
  import type { Request } from 'express';
  import type { User } from '../models/model';
  
  type RequireUserFn = (req: Request) => asserts req is Request & { user: User };
  
  export const requireUser: RequireUserFn = (req) => {
    if (!req.user) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
  };
  