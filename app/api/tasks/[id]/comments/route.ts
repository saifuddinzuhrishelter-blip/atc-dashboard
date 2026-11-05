import { api, database, viewer, eventStatement, HttpError } from '@/lib/server';
import { z } from 'zod';
export async function GET(req:Request,ctx:{params:Promise<{id:string}>}) { return api(req,async()=>{
  await viewer(); const {id}=await ctx.params;
  const comments=await database().prepare('SELECT * FROM comments WHERE task_id=? ORDER BY created_at ASC').bind(id).all<any>();
  return {comments:comments.results.map(r=>({id:r.id,taskId:r.task_id,body:r.body,authorId:r.author_id,authorName:r.author_name,createdAt:r.created_at}))};
}); }
export async function POST(req:Request,ctx:{params:Promise<{id:string}>}) { return api(req,async()=>{
  const user=await viewer(); if(user.role==='viewer') throw new HttpError(403,'Akun pemantau hanya dapat membaca.');
  const {id}=await ctx.params, {body}=z.object({body:z.string().trim().min(1,'Tulis komentar terlebih dahulu.').max(2000)}).parse(await req.json());
  const task=await database().prepare('SELECT * FROM tasks WHERE id=?').bind(id).first<any>();
  if(!task) throw new HttpError(404,'Aktivitas tidak ditemukan.');
  if(task.archived) throw new HttpError(400,'Pulihkan aktivitas sebelum menambahkan komentar.');
  await database().batch([
    database().prepare('INSERT INTO comments(id,task_id,body,author_id,author_name,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),id,body,user.userId || user.id,user.name,new Date().toISOString()),
    eventStatement(user,'mengomentari',task.title,task.division,id),
  ]);
  return {ok:true};
}); }
