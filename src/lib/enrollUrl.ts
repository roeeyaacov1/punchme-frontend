export function buildEnrollUrl(templateId: string): string {
  return `${window.location.origin}/join/${templateId}`;
}
