import { config } from "../config.js";

export function isAdmin(userId: string): boolean {
  return config.discord.adminUserIds.has(userId);
}

export function assertAdmin(userId: string): void {
  if (!isAdmin(userId)) {
    throw new Error("This command is restricted to configured Discord administrators.");
  }
}
