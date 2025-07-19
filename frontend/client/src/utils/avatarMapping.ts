/**
 * Maps text-based avatar codes to emoji icons
 * This allows the backend to store simple text while the frontend displays beautiful emojis
 */

export const avatarMapping: Record<string, string> = {
  // Agent avatars
  'AI': '🤖',
  'CODE': '💻', 
  'WRITE': '✍️',
  'RSRCH': '🔍',
  
  // Fallback avatars
  'ASSISTANT': '🤖',
  'CODER': '💻',
  'WRITER': '✍️', 
  'RESEARCHER': '🔍',
  
  // Additional avatars for future agents
  'DESIGN': '🎨',
  'DATA': '📊',
  'MUSIC': '🎵',
  'PHOTO': '📸',
  'VIDEO': '🎬',
  'GAME': '🎮',
  'COOK': '👨‍🍳',
  'TEACH': '👨‍🏫',
  'DOCTOR': '👨‍⚕️',
  'LAWYER': '👨‍💼',
  'SCIENCE': '🔬',
  'MATH': '🧮',
  'LANGUAGE': '🗣️',
  'TRAVEL': '✈️',
  'FITNESS': '💪',
  'FINANCE': '💰',
};

/**
 * Get emoji avatar from text code with fallback
 */
export function getAvatarEmoji(textAvatar: string | null | undefined): string {
  if (!textAvatar) return '❓'; // Default fallback
  
  const upperAvatar = textAvatar.toUpperCase();
  return avatarMapping[upperAvatar] || textAvatar || '❓';
}

/**
 * Check if a text avatar has an emoji mapping
 */
export function hasEmojiMapping(textAvatar: string | null | undefined): boolean {
  if (!textAvatar) return false;
  return textAvatar.toUpperCase() in avatarMapping;
}