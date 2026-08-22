import AsyncStorage from "@react-native-async-storage/async-storage";
import { request } from "./api";

const OUTBOX = "jastip:outbox:v1";
const CACHE = "jastip:cache:v1";
const AUTH = "jastip:auth:v1";

export const storage = {
  saveAuth: (value) => AsyncStorage.setItem(AUTH, JSON.stringify(value)),
  loadAuth: async () => JSON.parse((await AsyncStorage.getItem(AUTH)) || "null"),
  clearAuth: () => AsyncStorage.removeItem(AUTH),
  clearAll: () => AsyncStorage.multiRemove([AUTH, CACHE, OUTBOX]),
  saveCache: (value) => AsyncStorage.setItem(CACHE, JSON.stringify({ value, savedAt: Date.now() })),
  loadCache: async () => JSON.parse((await AsyncStorage.getItem(CACHE)) || "null"),
};

export async function enqueue(action) {
  const current = JSON.parse((await AsyncStorage.getItem(OUTBOX)) || "[]");
  current.push(action);
  await AsyncStorage.setItem(OUTBOX, JSON.stringify(current));
  return action;
}

export async function flushOutbox() {
  const current = JSON.parse((await AsyncStorage.getItem(OUTBOX)) || "[]");
  const remaining = [];
  let sent = 0;
  for (const action of current) {
    try {
      await request(action.path, action.options);
      sent += 1;
    } catch (error) {
      remaining.push(action);
      if (!error.status) break;
    }
  }
  await AsyncStorage.setItem(OUTBOX, JSON.stringify(remaining));
  return { sent, remaining: remaining.length };
}
