export type ProjectStatus = 'active' | 'pilot' | 'planned' | 'vision';

export type StatusItem = {
  status: ProjectStatus;
  statusLabel: string;
  description?: string;
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active Now',
  pilot: 'Pilot Development',
  planned: 'Planned',
  vision: 'Long-Term Vision',
};

export const STATUS_STYLES: Record<ProjectStatus, string> = {
  active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  pilot: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  planned: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  vision: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
};

export function statusItem(status: ProjectStatus, description?: string): StatusItem {
  return { status, statusLabel: STATUS_LABELS[status], description };
}
