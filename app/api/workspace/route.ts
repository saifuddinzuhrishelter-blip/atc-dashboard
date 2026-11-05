import { api, database, viewer, mapMember, mapTask } from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(req:Request) { return api(req,async()=>{
  const user=await viewer(); const db=database();
  const [tasks,members,events]=await db.batch([
    db.prepare('SELECT t.*, (SELECT COUNT(*) FROM comments c WHERE c.task_id=t.id) AS comment_count FROM tasks t ORDER BY t.due_date ASC,t.created_at DESC'),
    db.prepare('SELECT * FROM members WHERE active=1 ORDER BY name'),
    db.prepare('SELECT * FROM events ORDER BY created_at DESC LIMIT 60'),
  ]);
  return {user,tasks:tasks.results.map(mapTask),members:members.results.map(mapMember),events:events.results.map((r:any)=>({id:r.id,taskId:r.task_id,division:r.division,action:r.action,title:r.title,actorId:r.actor_id,actorName:r.actor_name,details:r.details,createdAt:r.created_at})),syncedAt:new Date().toISOString()};
}); }
