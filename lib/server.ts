import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import type { Member, Task } from './types';
import { z } from 'zod';

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function database() { if (!env.DB) throw new HttpError(503, 'Penyimpanan belum tersedia. Coba lagi sesaat.'); return env.DB; }
export function response(data: unknown, status=200) { return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}}); }
export async function api(req: Request, fn: () => Promise<unknown>) {
  try {
    if (!['GET','HEAD'].includes(req.method)) {
      const origin = req.headers.get('origin');
      const host = req.headers.get('host') || new URL(req.url).host;
      if (origin && new URL(origin).host !== host && new URL(origin).host !== new URL(req.url).host) throw new HttpError(403,'Permintaan tidak diizinkan.');
      if (!req.headers.get('content-type')?.includes('application/json') && req.method !== 'DELETE') throw new HttpError(415,'Gunakan format JSON.');
    }
    return response(await fn());
  } catch(e) {
    if(e instanceof HttpError) return response({error:e.message},e.status);
    if(e instanceof z.ZodError) return response({error:e.issues[0]?.message || 'Isian belum lengkap.'},400);
    if(e instanceof SyntaxError) return response({error:'Format permintaan tidak valid.'},400);
    console.error('ATC API',e);
    return response({error:'Pembaruan belum tersimpan. Silakan coba lagi.'},500);
  }
}
export async function viewer(): Promise<Member> {
  const identity=await getChatGPTUser();
  if (!identity) throw new HttpError(401,'Masuk dengan akun ChatGPT yang diberi akses.');
  const db=database();
  let member=await db.prepare('SELECT * FROM members WHERE user_id=?').bind(identity.userId).first<any>();
  if(!member) {
    const email=identity.email.trim().toLowerCase();
    await db.prepare('UPDATE members SET user_id=? WHERE email=? AND user_id IS NULL AND active=1').bind(identity.userId,email).run();
    // New Sites start owner-private; the first authenticated owner initializes the administrator.
    await db.prepare("INSERT INTO members(id,user_id,email,name,division,role,active,created_at) SELECT ?,?,?,?,'all','admin',1,? WHERE NOT EXISTS(SELECT 1 FROM members)").bind(crypto.randomUUID(),identity.userId,email,identity.fullName || identity.email.split('@')[0],new Date().toISOString()).run();
    member=await db.prepare('SELECT * FROM members WHERE user_id=?').bind(identity.userId).first<any>();
  }
  if(!member || !member.active) throw new HttpError(403,'Akun Anda belum terdaftar sebagai anggota ATC. Hubungi admin.');
  return mapMember(member);
}
export function mapMember(r:any): Member { return {id:r.id,userId:r.user_id,email:r.email,name:r.name,division:r.division,role:r.role,active:r.active,createdAt:r.created_at}; }
export function mapTask(r:any): Task { return {id:r.id,division:r.division,title:r.title,description:r.description,pic:r.pic,dueDate:r.due_date,status:r.status,priority:r.priority,progress:r.progress,link:r.link,archived:r.archived,version:r.version,createdBy:r.created_by,updatedBy:r.updated_by,createdAt:r.created_at,updatedAt:r.updated_at,commentCount:r.comment_count || 0}; }
export function assertEdit(user:Member, division:string) { if(user.role!=='admin' && !(user.role==='member' && user.division===division)) throw new HttpError(403,'Anda hanya dapat mengubah aktivitas divisi Anda.'); }
export function assertAdmin(user:Member) { if(user.role!=='admin') throw new HttpError(403,'Hanya admin yang dapat mengelola anggota.'); }
export const taskInput=z.object({
  division:z.enum(['accounting','tax','compliance']),
  title:z.string().trim().min(3,'Judul minimal 3 karakter.').max(150,'Judul maksimal 150 karakter.'),
  description:z.string().trim().max(4000).default(''),
  pic:z.string().trim().min(1,'Isi nama PIC.').max(100),
  dueDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/,'Isi tenggat yang valid.').refine(s=>!Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s,'Tanggal tidak valid.'),
  status:z.enum(['todo','progress','review','blocked','done']),
  priority:z.enum(['normal','high','urgent']),
  progress:z.number().int().min(0).max(100),
  link:z.string().trim().max(2000).refine(v=>!v || /^https?:\/\//i.test(v),'Tautan harus diawali https:// atau http://.').refine(v=>!v || URL.canParse(v),'Tautan tidak valid.').default(''),
});
export function normalizeTask(t:z.infer<typeof taskInput>) { return {...t,progress:t.status==='done'?100:t.status==='todo'?0:Math.min(t.progress,99)}; }
export function eventStatement(user:Member,action:string,title:string,division='all',taskId:string|null=null,details='') {
  return database().prepare('INSERT INTO events(id,task_id,division,action,title,actor_id,actor_name,details,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),taskId,division,action,title,user.userId || user.id,user.name,details,new Date().toISOString());
}
