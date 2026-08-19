import jwt, { Secret, SignOptions } from "jsonwebtoken";

const jwtSecret: Secret =
  process.env.JWT_SECRET ?? "change_this_secret";

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "1d") as jwt.SignOptions["expiresIn"];

export function createToken(payload: { id: string }) {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, jwtSecret) as {
    id: string;
    iat: number;
    exp: number;
  };
}