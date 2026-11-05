import { api, database, viewer, assertEdit, taskInput, normalizeTask, HttpError, mapTask } from '@/lib/server';
import { z } from 'zod';
export async function PATCH(req:Request,ctx:{params:Promise<{id:string}>}) { return api(req,async()=>{
  const user=await viewer(), {id}=await ctx.params, db=database();
  const prior=await db.prepare('SELECT * FROM tasks WHERE id=?').bind(id).first<any>();
  if(!prior) throw new HttpError(404,'Aktivitas tidak ditemukan.');
  assertEdit(user,prior.division);
  const raw=z.record(z.unknown()).parse(await req.json());
  const version=z.number().int().min(1).parse(raw.version);
  const archiveOnly=typeof raw.archived==='boolean';
  const t=archiveOnly?normalizeTask(taskInput.parse(mapTask(prior))):normalizeTask(taskInput.parse(raw));
  assertEdit(user,t.division);
  const archived=archiveOnly?Number(raw.archived):prior.archived;
  const now=new Date().toISOString(), uid=user.userId || user.id;
  const eventId=crypto.randomUUID(),action=archiveOnly?(archived?'mengarsipkan':'memulihkan'):'memperbarui';
  const detail=archiveOnly?'':JSON.stringify({before:{status:prior.status,progress:prior.progress,pic:prior.pic,dueDate:prior.due_date},after:{status:t.status,progress:t.progress,pic:t.pic,dueDate:t.dueDate}});
  // The second statement logs only a successful versioned update in this atomic batch.
  const result=await db.batch([
    db.prepare('UPDATE tasks SET division=?,title=?,description=?,pic=?,due_date=?,status=?,priority=?,progress=?,link=?,archived=?,version=version+1,updated_by=?,updated_at=? WHERE id=? AND version=?').bind(t.division,t.title,t.description,t.pic,t.dueDate,t.status,t.priority,t.progress,t.link,archived,uid,now,id,version),
    db.prepare('INSERT INTO events(id,task_id,division,action,title,actor_id,actor_name,details,created_at) SELECT ?,?,?,?,?,?,?,?,? WHERE changes()=1').bind(eventId,id,t.division,action,t.title,uid,user.name,detail,now),
  ]);
  if(!result[0].meta.changes) throw new HttpError(409,'Aktivitas baru saja diperbarui anggota lain. Tutup lalu buka kembali untuk memuat versi terbaru.');
  return {task:mapTask(await db.prepare('SELECT * FROM tasks WHERE id=?').bind(id).first())};
}); }
