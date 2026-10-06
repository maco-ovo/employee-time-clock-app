// Owner: A
import bcrypt from "bcryptjs";

const ROUNDS = 12;
let dummyHash: Promise<string> | null = null;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

// Pass hash = null when the user does not exist: we still run a bcrypt compare
// so the response time does not reveal which emails are registered.
export async function verifyPassword(password: string, hash: string | null): Promise<boolean> {
  if (hash === null) {
    dummyHash ??= bcrypt.hash("not-a-real-password", ROUNDS);
    await bcrypt.compare(password, await dummyHash);
    return false;
  }
  return bcrypt.compare(password, hash);
}
