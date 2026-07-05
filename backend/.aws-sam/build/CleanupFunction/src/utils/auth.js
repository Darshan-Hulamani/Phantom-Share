import bcrypt from "bcryptjs";

/**
 * Hash password using bcryptjs
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Verify input password against hashed password
 */
export async function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  return await bcrypt.compare(password, hashedPassword);
}
