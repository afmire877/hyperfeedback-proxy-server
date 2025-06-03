import 'express-session';

declare module 'express-session' {
  type SessionData = {
    asset_url?: string;
  };
}