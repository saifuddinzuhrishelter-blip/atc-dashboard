import { api, database, viewer, assertAdmin, eventStatement, HttpError } from '@/lib/server';
export async function DELETE(req:Request,ctx:{params:Promise<{id:string}>}) { return api(req,async()=>{
  const user=await viewer(); assertAdmin(user); const {id}=await ctx.params;
  const member=await database().prepare('SELECT * FROM members WHERE id=?').bind(id).first<any>();
  if(!member) throw new HttpError(404,'Anggota tidak ditemukan.');
  if(member.role==='admin') throw new HttpError(400,'Akun admin tidak dapat dinonaktifkan.');
  await database().batch([database().prepare('UPDATE members SET active=0 WHERE id=?').bind(id),eventStatement(user,'menonaktifkan akses',member.name)]);
  return {ok:true};
}); }
