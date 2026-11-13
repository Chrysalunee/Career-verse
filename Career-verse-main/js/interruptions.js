// Pemicu gangguan harian dan konsekuensi pilihan pemain.
export function chooseInterruption(workday, state, choice) {
  workday.interruptions += 1;
  if (choice === 'help') {
    state.relationship = Math.min(100, state.relationship + 3);
    state.energy = Math.max(0, state.energy - 5);
    return 'Kamu membantu rekan; relasi menguat, tetapi waktu fokus berkurang.';
  }
  if (choice === 'ignore') {
    state.relationship = Math.max(0, state.relationship - 2);
    return 'Kamu menjaga fokus, namun rekan mungkin membutuhkan konteks kapan kamu bisa membantu.';
  }
  return 'Kamu menunda dengan sopan dan menyepakati waktu untuk kembali membantu.';
}
export function interruptionDeferral(state) {
  state.relationship = Math.min(100, state.relationship + 1);
  return 'Kamu menyampaikan kapan bisa membantu, menjaga fokus sekaligus ekspektasi rekan.';
}
