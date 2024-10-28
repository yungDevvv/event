import { clsx } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge"


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateInviteId(length = 5) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let inviteId = '';
  for (let i = 0; i < length; i++) {
    inviteId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return inviteId;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const generateId = customAlphabet(alphabet, 7);