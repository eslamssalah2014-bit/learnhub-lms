'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    sb.from('profiles').select('*, enrollments(id, courses(title_ar))').eq('role','student').order('created_at',{ascending:false}).then(({data}) => setStudents(data||[]))
  }, [])

  const filtered = students.filter((s: any) => !search || s.full_name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>الطلاب ({students.length})</h1>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث..." style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, width: 200 }} />
      </div>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ borderBottom: '1px solid #f0f0f0' }}>{['الطالب','الكورسات','تاريخ التسجيل'].map(h => <th key={h} style={{ textAlign: 'right', padding: '8px 12px', color: '#888', fontWeight: 500 }}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((s: any) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#534AB7' }}>{s.full_name?.charAt(0)||'؟'}</div>
                    <span style={{ fontWeight: 500 }}>{s.full_name||'بدون اسم'}</span>
                  </div>
                </td>
                <td style={{ padding: '12px', color: '#666' }}>{s.enrollments?.length > 0 ? s.enrollments.map((e: any) => e.courses?.title_ar).join('، ') : <span style={{ color: '#aaa' }}>لم يسجل بعد</span>}</td>
                <td style={{ padding: '12px', color: '#aaa' }}>{new Date(s.created_at).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>لا يوجد طلاب</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
