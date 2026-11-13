// Inbox lokal simulasi kantor. Tidak mengirim atau menerima pesan sungguhan.
export function createInbox() { return { emails: [], chats: [], unread: 0, nextId: 1 }; }
export function triggerMessage(inbox, template, day, hour, channel = 'email') {
  if (!inbox || !template) return null;
  const item = { id: `msg-${inbox.nextId++}`, channel, from: template.from || 'Tim Careerverse', subject: template.subject || template.text || 'Pesan baru', text: template.text || '', day, hour, important: Boolean(template.important), needsReply: Boolean(template.replies?.length), deadlineDay: template.important ? day : day + 1, read: false, replied: false, replies: template.replies || [], kind: template.kind || 'info' };
  const bucket = channel === 'chat' ? inbox.chats : inbox.emails;
  bucket.unshift(item); inbox.unread += 1;
  return item;
}
export function replyToMessage(inbox, id, tone, state, day = 1) {
  const item = [...(inbox.emails || []), ...(inbox.chats || [])].find(message => message.id === id);
  if (!item || item.replied || !item.needsReply) return false;
  item.replied = true; item.read = true; item.replyTone = tone;
  const effects = {
    polite: { relationship: 2, reputation: 1, message: 'Balasan sopan menjaga kolaborasi.' },
    firm: { relationship: 1, internal: 2, message: 'Balasan tegas dan jelas membantu menetapkan batas serta ekspektasi.' },
    casual: { relationship: 2, reputation: 0, message: 'Balasan santai terasa akrab; pastikan konteks profesional tetap jelas.' },
    defensive: { relationship: -3, reputation: -1, message: 'Nada defensif dapat menghambat diskusi; kamu masih bisa mengklarifikasi dengan tenang.' }
  }[tone] || { relationship: 0, reputation: 0, message: 'Pesan dibalas.' };
  state.relationship = Math.max(0, Math.min(100, state.relationship + effects.relationship));
  state.reputation = Math.max(0, Math.min(100, state.reputation + effects.reputation));
  if (effects.internal) state.internal = Math.max(0, Math.min(100, state.internal + effects.internal));
  if (day > item.deadlineDay) { state.stress = Math.min(100, state.stress + 3); effects.message += ' Balasan terlambat menambah tekanan.'; }
  inbox.unread = Math.max(0, inbox.unread - 1);
  return effects;
}
export function markMessageRead(inbox, id) {
  const item = [...(inbox.emails || []), ...(inbox.chats || [])].find(message => message.id === id);
  if (!item || item.read) return false;
  item.read = true; inbox.unread = Math.max(0, inbox.unread - 1); return true;
}
export function focusSlot(workday) { workday.focusMode = !workday.focusMode; return workday.focusMode; }
export function shouldHoldNotification(workday, item) { return Boolean(workday?.focusMode && !item?.important); }
export function overdueReplies(inbox, day) { return [...(inbox.emails || []), ...(inbox.chats || [])].filter(item => item.needsReply && !item.replied && day > item.deadlineDay); }
