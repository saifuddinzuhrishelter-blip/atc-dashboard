import { api, database, viewer, assertEdit, taskInput, normalizeTask, eventStatement, mapTask } from '@/lib/server';
export async function POST(req:Request) { return api(req,async()=>{
  const user=await viewer(); const t=normalizeTask(taskInput.parse(await req.json())); assertEdit(user,t.division);
  const id=crypto.randomUUID(), now=new Date().toISOString(), uid=user.userId || user.id;
  await database().batch([
    database().prepare('INSERT INTO tasks(id,division,title,description,pic,due_date,status,priority,progress,link,created_by,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,t.division,t.title,t.description,t.pic,t.dueDate,t.status,t.priority,t.progress,t.link,uid,uid,now,now),
    eventStatement(user,'menambahkan',t.title,t.division,id),
  ]);
  return {task:mapTask(await database().prepare('SELECT * FROM tasks WHERE id=?').bind(id).first())};
}); }
