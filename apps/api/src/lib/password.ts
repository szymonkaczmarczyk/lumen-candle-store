import { hash, verify } from "@node-rs/argon2";

const argon2idOptions = { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (password: string) => hash(password, argon2idOptions);

export const verifyPassword = (passwordHash: string, password: string) => verify(passwordHash, password);
