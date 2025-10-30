// utils/authEvents.ts
export type AuthEvent = "SIGN_IN" | "SIGN_OUT";

type AuthEventListener = (event: AuthEvent) => void;

const listeners = new Set<AuthEventListener>();

export function emitAuthEvent(event: AuthEvent) {
  console.log(`Auth event emitted: ${event}`);
  listeners.forEach((listener) => {
    listener(event);
  });
}

export function onAuthEvent(listener: AuthEventListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
