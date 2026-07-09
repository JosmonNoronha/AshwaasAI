import AsyncStorage from "@react-native-async-storage/async-storage";

// Local, on-device history of what the user actually saw/typed — kept
// separate from the backend's session_memory, which stores translated/
// interpreted text for model context only, not the literal conversation.
const CONVO_LIST_KEY = "conversation_list";

function storageKey(conversationId) {
  return `chat_messages:${conversationId}`;
}

export async function loadLocalMessages(conversationId) {
  try {
    const raw = await AsyncStorage.getItem(storageKey(conversationId));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Failed to load local chat history", e);
    return null;
  }
}

export async function saveLocalMessages(conversationId, messages) {
  try {
    await AsyncStorage.setItem(storageKey(conversationId), JSON.stringify(messages));
  } catch (e) {
    console.warn("Failed to save local chat history", e);
  }
}

export async function deleteLocalMessages(conversationId) {
  try {
    await AsyncStorage.removeItem(storageKey(conversationId));
  } catch (e) {
    console.warn("Failed to delete local chat history", e);
  }
}

export async function loadConversationList() {
  try {
    const raw = await AsyncStorage.getItem(CONVO_LIST_KEY);
    const list = raw ? JSON.parse(raw) : [];
    // Most recently updated first.
    return list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  } catch (e) {
    console.warn("Failed to load conversation list", e);
    return [];
  }
}

async function _saveConversationList(list) {
  try {
    await AsyncStorage.setItem(CONVO_LIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to save conversation list", e);
  }
}

// Adds a new conversation, or updates title/updated_at if it already exists.
export async function upsertConversation({ id, title, updated_at }) {
  const list = await loadConversationList();
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], title: title ?? list[idx].title, updated_at };
  } else {
    list.push({ id, title, updated_at });
  }
  await _saveConversationList(list);
}

export async function deleteConversation(id) {
  const list = await loadConversationList();
  await _saveConversationList(list.filter((c) => c.id !== id));
  await deleteLocalMessages(id);
}

export async function clearAllConversations() {
  await AsyncStorage.removeItem(CONVO_LIST_KEY);
  await clearAllLocalMessages();
}