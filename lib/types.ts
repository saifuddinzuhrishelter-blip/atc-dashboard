export type Division = 'accounting' | 'tax' | 'compliance';
export type Status = 'todo' | 'progress' | 'review' | 'blocked' | 'done';
export type Member = { id: string; userId: string | null; email: string; name: string; division: Division | 'all'; role: 'admin' | 'member' | 'viewer'; active: number; createdAt: string };
export type Task = { id: string; division: Division; title: string; description: string; pic: string; dueDate: string; status: Status; priority: 'normal' | 'high' | 'urgent'; progress: number; link: string; archived: number; version: number; createdBy: string; updatedBy: string; createdAt: string; updatedAt: string; commentCount?: number };
export type Comment = { id: string; taskId: string; body: string; authorId: string; authorName: string; createdAt: string };
export type Activity = { id: string; taskId: string | null; division: string; action: string; title: string; actorId: string; actorName: string; details: string; createdAt: string };
export type Workspace = { user: Member; tasks: Task[]; members: Member[]; events: Activity[]; syncedAt: string };
export const DIVISIONS = [
  { id: 'accounting' as Division, name: 'Accounting', caption: 'Pencatatan & pelaporan', initial: 'AC', color: '#2382cd' },
  { id: 'tax' as Division, name: 'Tax', caption: 'Administrasi & pelaporan pajak', initial: 'TX', color: '#8b62c1' },
  { id: 'compliance' as Division, name: 'Compliance', caption: 'Kepatuhan & pengendalian', initial: 'CO', color: '#1d9c85' },
];
export const STATUSES: Record<Status, string> = { todo:'Belum mulai', progress:'Dikerjakan', review:'Menunggu review', blocked:'Terkendala', done:'Selesai' };
export function todayJakarta() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date()); }
export function canEdit(user: Member | null, division: string) { return !!user && (user.role === 'admin' || (user.role === 'member' && user.division === division)); }
