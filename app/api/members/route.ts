import { api, database, viewer, assertAdmin, eventStatement, HttpError } from '@/lib/server';
import { z } from 'zod';
export async function POST(req:Request) { return api(req,async()=>{
  const user=await viewer(); assertAdmin(user);
  const member=z.object({email:z.string().trim().email('Email tidak valid.').max(200).transform(s=>s.toLowerCase()),name:z.string().trim().min(2).max(100),division:z.enum(['accounting','tax','compliance','all']),role:z.enum(['member','viewer'])}).parse(await req.json());
  if(member.role==='member' && member.division==='all') throw new HttpError(400,'Pilih divisi untuk anggota.');
  const prior=await database().prepare('SELECT * FROM members WHERE email=?').bind(member.email).first<any>();
  if(prior?.role==='admin') throw new HttpError(400,'Akun admin tidak dapat diubah di sini.');
  await database().batch([
    database().prepare("INSERT INTO members(id,email,name,division,role,active,created_at) VALUES(?,?,?,?,?,1,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,division=excluded.division,role=excluded.role,active=1").bind(crypto.randomUUID(),member.email,member.name,member.division,member.role,new Date().toISOString()),
    eventStatement(user,'mengatur akses',member.name),
  ]);
  return {ok:true,message:'Anggota terdaftar. Pastikan email yang sama juga diberi akses pada pengaturan berbagi situs.'};
}); }
