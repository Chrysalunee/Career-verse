// Dampak dialog rapat, persiapan, dan scope proyek.
const outcomes = {
  obstacle: { reputation: 2, internal: 3, relationship: 3, stress: -2, message: 'Kendala disampaikan lebih awal; tim menyusun ulang prioritas.' },
  clarify: { reputation: 1, internal: 2, relationship: 1, stress: -1, message: 'Kriteria dan agenda diperjelas sebelum pekerjaan dilanjutkan.' },
  scope: { reputation: 2, internal: 2, relationship: 0, stress: -1, message: 'Scope tambahan dinegosiasikan dengan dampak waktu dan kapasitas yang jelas.' },
  own: { reputation: 1, internal: 1, relationship: 2, stress: 4, message: 'Kamu mengambil tanggung jawab. Pastikan bebannya realistis dan tercatat.' }
};
export function meetingOutcome(state, choice, prepared = false) {
  const effect = outcomes[choice] || outcomes.clarify;
  const multiplier = prepared ? 1.5 : 1;
  for (const key of ['reputation', 'internal', 'relationship', 'stress']) {
    state[key] = Math.max(0, Math.min(100, (state[key] || 0) + Math.round(effect[key] * multiplier)));
  }
  return { ...effect, prepared, message: prepared ? `${effect.message} Persiapanmu membantu rapat lebih terarah.` : effect.message };
}
export function focusTimeRemaining(workday) {
  return (workday?.slots || []).filter(slot => !slot.completed && slot.type === 'task').length;
}
