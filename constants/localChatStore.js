import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

// Every key below is scoped to the currently logged-in user, so switching
// accounts on the same device can never show one account's chats to
// another — each account effectively has its own isolated storage
// namespace on the device.

async function getUserId() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || "anon";
}

function convoListKey(userId) {
  return `conversation_list:${userId}`;
}

function chatMessagesKey(userId, conversationId) {
  return `chat_messages:${userId}:${conversationId}`;
}

// ── Messages for one conversation ──────────────────────────────────────
export async function loadLocalMessages(conversationId) {
  try {
    const userId = await getUserId();
    const raw = await AsyncStorage.getItem(chatMessagesKey(userId, conversationId));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Failed to load local chat history", e);
    return null;
  }
}

export async function saveLocalMessages(conversationId, messages) {
  try {
    const userId = await getUserId();
    await AsyncStorage.setItem(chatMessagesKey(userId, conversationId), JSON.stringify(messages));
  } catch (e) {
    console.warn("Failed to save local chat history", e);
  }
}

export async function deleteLocalMessages(conversationId) {
  try {
    const userId = await getUserId();
    await AsyncStorage.removeItem(chatMessagesKey(userId, conversationId));
  } catch (e) {
    console.warn("Failed to delete local chat history", e);
  }
}

async function clearAllLocalMessages() {
  try {
    const userId = await getUserId();
    const prefix = `chat_messages:${userId}:`;
    const keys = await AsyncStorage.getAllKeys();
    const ownKeys = keys.filter((k) => k.startsWith(prefix));
    if (ownKeys.length > 0) {
      await AsyncStorage.multiRemove(ownKeys);
    }
  } catch (e) {
    console.warn("Failed to clear local chat history", e);
  }
}

// ── Conversation list (titles, timestamps) ───────────────────────────────
export async function loadConversationList() {
  try {
    const userId = await getUserId();
    const raw = await AsyncStorage.getItem(convoListKey(userId));
    const list = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  } catch (e) {
    console.warn("Failed to load conversation list", e);
    return [];
  }
}

async function _saveConversationList(userId, list) {
  try {
    await AsyncStorage.setItem(convoListKey(userId), JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to save conversation list", e);
  }
}

export async function upsertConversation({ id, title, updated_at }) {
  const userId = await getUserId();
  const raw = await AsyncStorage.getItem(convoListKey(userId));
  const list = raw ? JSON.parse(raw) : [];
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], title: title ?? list[idx].title, updated_at };
  } else {
    list.push({ id, title, updated_at });
  }
  await _saveConversationList(userId, list);
}

export async function deleteConversation(id) {
  const userId = await getUserId();
  const raw = await AsyncStorage.getItem(convoListKey(userId));
  const list = raw ? JSON.parse(raw) : [];
  await _saveConversationList(userId, list.filter((c) => c.id !== id));
  await deleteLocalMessages(id);
}

export async function clearAllConversations() {
  const userId = await getUserId();
  await AsyncStorage.removeItem(convoListKey(userId));
  await clearAllLocalMessages();
}