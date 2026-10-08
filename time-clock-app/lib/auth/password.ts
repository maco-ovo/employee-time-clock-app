// Owner: A
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

const ROUNDS = 12;
let dummyHash: Promise<string> | null = null;

export function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, ROUNDS);
}

// Pass hash = null when the user does not exist: we still run a bcrypt compare
// so the response time does not reveal which emails are registered.
export async function verifyPassword(
	password: string,
	hash: string | null,
): Promise<boolean> {
	if (hash === null) {
		dummyHash ??= bcrypt.hash("not-a-real-password", ROUNDS);
		await bcrypt.compare(password, await dummyHash);
		return false;
	}
	return bcrypt.compare(password, hash);
}

// == Generate Password

// No look-alike characters (0/O, 1/l/I) so the admin can read it out loud.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generatePassword(length = 14): string {
	let password = "";
	for (let i = 0; i < length; i++) {
		password += ALPHABET[randomInt(ALPHABET.length)];
	}
	return password;
}
