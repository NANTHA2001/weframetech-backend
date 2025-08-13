export interface User {
    id: string;
    role: 'attendee' | 'organizer' | 'admin';
    tenant: string;
  }
  
  // src/types/payload.ts
  export interface Payload {
    findByID(args: { collection: string; id: string }): Promise<any>;
    find(args: { collection: string; limit?: number; where?: any; sort?: string }): Promise<any>;
    create(args: { collection: string; data: any }): Promise<any>;
    update(args: { collection: string; id: string; data: any }): Promise<any>;
  }