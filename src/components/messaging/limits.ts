/** Product limits, mirrored from the backend's MESSAGING_* defaults. The
 * API is the real gate (422 automation_invalid); these keep the counters
 * honest while typing. */
export const MESSAGE_LIMITS = { title: 40, body: 160, gift: 12 } as const;
