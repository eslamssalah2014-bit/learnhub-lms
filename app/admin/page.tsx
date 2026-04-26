'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, courses: 0, completed: 0 })
  const [recent, setRecent] = useState([])

  useEffect(() => {
    async function load() {
      const [s, c, p] = await Promise.all([
        sb.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
        sb.from('courses').select('id', { count: 'exact' }).eq('is_published', true),
        sb.from('progress').select('*, profiles(full_name), courses(title_ar)').eq('completed', true).order('updated_at', { ascending: false }).limit(8)
      ])
      setStats({ students: s.count || 0, courses: c.count || 0, completed: p.data?.length || 0 })
      setRecent(p.data || [])
    }
    load()
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>مرحباً 👋</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: '1.5rem' }}>ملخص أداء الكورسات</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {[{ label: 'إجمالي الطلاب', value: stats.students }, { label: 'الكورسات النشطة', value: stats.courses }, { label: 'محاضرات مكتملة', value: stats.completed }].map(s => (
          <div key={s.label} style={{ background: '#f5f5f5', borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 500 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: '1rem' }}>آخر نشاط</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ borderBottom: '1px solid #f0f0f0' }}>{['الطالب','الكورس','الحالة'].map(h => <th key={h} style={{ textAlign: 'right', padding: '8px 12px', color: '#888', fontWeight: 500 }}>{h}</th>)}</tr></thead>
          <tbody>
            {recent.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '10px 12px' }}>{p.profiles?.full_name || '—'}</td>
                <td style={{ padding: '10px 12px', color: '#666' }}>{p.courses?.title_ar || '—'}</td>
                <td style={{ padding: '10px 12px' }}><span style={{ background: '#EAF3DE', color: '#3B6D11', fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 500 }}>✓ مكتمل</span></td>
              </tr>
            ))}
            {recent.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>لا يوجد نشاط بعد</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
