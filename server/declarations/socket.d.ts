import { Socket } from 'socket.io';

declare module 'socket.io' {
  interface Socket {
    userId?: string; // Make it optional with '?' since it won't be set immediately
  }
}
