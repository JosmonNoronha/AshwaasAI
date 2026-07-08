import AsyncStorage from "@react-native-async-storage/async-storage";

// Local, on-device history of what the user actually saw/typed — kept
// separate from the backend's session_memory, which stores translated/
// interpreted text for model context only, not the literal conversation.

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