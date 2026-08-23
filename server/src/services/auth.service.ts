import bcrypt from "bcryptjs"
import User from "../models/User.js"

export async function createUser(name: string, email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  return User.create({
    name,
    email,
    password: hashedPassword,
    avatar: `https://api.dicebear.com/6.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
  })
}

export async function findUserByEmail(email: string) {
  return User.findOne({ email }).exec()
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);
  return User.findByIdAndUpdate(userId, { password: hashedPassword }).exec();
}
