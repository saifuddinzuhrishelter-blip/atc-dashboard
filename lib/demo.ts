import { Task, Activity } from './types';
function offset(days:number) { const now=new Date(); now.setUTCDate(now.getUTCDate()+days); return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
export function exampleTasks():Task[] {
  const rows: Array<[Task['division'],string,string,string,number,Task['status'],Task['priority'],number]> = [
    ['accounting','Rekonsiliasi bank & buku besar','Cocokkan mutasi bank dengan pencatatan di Accurate Online.','Tim Accounting',1,'progress','high',75],
    ['accounting','Closing laporan keuangan bulanan','Lengkapi jurnal penyesuaian dan checklist tutup buku.','Tim Accounting',3,'review','normal',90],
    ['accounting','Review aging piutang cabang','Periksa saldo piutang serta tindak lanjut selisih per cabang.','Tim Accounting',5,'todo','normal',0],
    ['tax','Persiapan data faktur pajak','Validasi data invoice dan DPP sebelum diproses di Coretax.','Tim Tax',0,'review','high',90],
    ['tax','Ekualisasi omzet & faktur pajak','Cocokkan omzet di Accurate Online dengan data faktur pajak.','Tim Tax',-1,'blocked','urgent',45],
    ['tax','Rekonsiliasi bukti potong klien','Lengkapi daftar bukti potong dan konfirmasi dokumen yang belum diterima.','Tim Tax',6,'progress','normal',50],
    ['compliance','Monitoring bukti kepatuhan cabang','Periksa kelengkapan bukti dan catat tindak lanjut per cabang.','Tim Compliance',2,'progress','high',60],
    ['compliance','Tindak lanjut temuan audit internal','Pantau penyelesaian action plan bersama PIC terkait.','Tim Compliance',4,'todo','normal',0],
    ['compliance','Review matriks otorisasi pembayaran','Dokumentasikan hasil review kesesuaian otorisasi di Accurate Online.','Tim Compliance',-2,'done','normal',100],
  ];
  return rows.map((r,i)=>({id:`contoh-${i+1}`,division:r[0],title:r[1],description:r[2],pic:r[3],dueDate:offset(r[4]),status:r[5],priority:r[6],progress:r[7],link:'',archived:0,version:1,createdBy:'ilustrasi',updatedBy:'ilustrasi',createdAt:new Date().toISOString(),updatedAt:new Date(Date.now()-i*3600000).toISOString(),commentCount:i%3}));
}
export function exampleEvents(tasks:Task[]):Activity[] { return tasks.slice(0,4).map((t,i)=>({id:`example-event-${i}`,taskId:t.id,division:t.division,action:i===1?'mengubah status':'memperbarui progres',title:t.title,actorId:'ilustrasi',actorName:t.pic,details:'',createdAt:t.updatedAt})); }
export const TEMPLATES=[
 {division:'accounting',title:'Rekonsiliasi bank & buku besar',description:'Cocokkan mutasi bank dengan buku besar Accurate Online. Jelaskan setiap selisih dan lampirkan tautan kertas kerja.'},
 {division:'accounting',title:'Closing laporan keuangan bulanan',description:'Lengkapi checklist tutup buku, jurnal penyesuaian, rekonsiliasi antarentitas, serta review laporan keuangan.'},
 {division:'tax',title:'Persiapan data faktur pajak',description:'Validasi identitas, invoice, BTK, management fee, DPP dan PPN sesuai dokumen sumber; lakukan review sebelum finalisasi di Coretax.'},
 {division:'tax',title:'Ekualisasi omzet & faktur pajak',description:'Rekonsiliasi omzet Accurate Online dengan data faktur pajak Coretax. Dokumentasikan selisih dan tindak lanjut.'},
 {division:'compliance',title:'Monitoring bukti kepatuhan cabang',description:'Periksa bukti kepatuhan, identifikasi dokumen yang belum lengkap, dan koordinasikan tindak lanjut dengan PIC.'},
 {division:'compliance',title:'Tindak lanjut temuan audit internal',description:'Pantau action plan, penanggung jawab, tenggat dan bukti penyelesaian setiap temuan.'},
];
