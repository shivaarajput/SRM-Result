export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        regNo: string;
        email: string;
      };
    }
  }
}