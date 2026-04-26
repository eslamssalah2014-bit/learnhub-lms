'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function ReportsPage() {
  const [data, setData] = useState([])
  const [courses, setCourses] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [enrRes, cRes] = await Promise.all([
        sb.from('enrollments').select('user_id,course_id,profiles(full_name),courses(title_ar,lectures(id))'),
        sb.from('courses').select('id,title_ar')
      ])
      const enriched = await Promise.all((enrRes.data||[]).map(async en => {
        const { count } = await sb.from('progress').select('id',{count:'exact'}).eq('user_id',en.user_id).eq('course_id',en.course_id).eq('completed',true)
        const total = en.courses?.lectures?.length || 0
        const done = count || 0
        return { ...en, done, total, pct: total > 0 ? Math.round((done/total)*100) : 0 }
      }))
      setData(enriched); setCourses(cRes.data||[]); setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? data : data.filter((d: any) => d.course_id === filter)

  const exportCsv = () => {
    const rows = [['الطالب','الكورس','المكتمل','الإجمالي','النسبة'], ...filtered.map((d: any) => [d.profiles?.full_name, d.courses?.title_ar, d.done, d.total, d.pct+'%'])]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.join(',')).join('\n')],{type:'text/csv;charset=utf-8'}))
    a.download = 'report.csv'; a.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>الريبورت</h1>
        <button onClick={exportCsv} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13 }}>تصدير CSV ↓</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {[{label:'أكملوا بالكامل',val:filtered.filter((d:any)=>d.pct===100).length,c:'#3B6D11',bg:'#EAF3DE'},{label:'في المنتصف',val:filtered.filter((d:any)=>d.pct>0&&d.pct<100).length,c:'#534AB7',bg:'#EEEDFE'},{label:'لم يبدأوا',val:filtered.filter((d:any)=>d.pct===0).length,c:'#888',bg:'#f5f5f5'}].map(s=>(
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: s.c, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: s.c }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>تفاصيل الطلاب</h2>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}>
            <option value="all">كل الكورسات</option>
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title_ar}</option>)}
          </select>
        </div>
        {loading ? <p style={{ color: '#aaa', fontSize: 13 }}>جاري التحميل...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid #f0f0f0' }}>{['الطالب','الكورس','المحاضرات','التقدم','الحالة'].map(h=><th key={h} style={{ textAlign:'right',padding:'8px 12px',color:'#888',fontWeight:500 }}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((d: any, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{d.profiles?.full_name}</td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>{d.courses?.title_ar}</td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>{d.done}/{d.total}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 80 }}><div className="progress-fill" style={{ width: d.pct+'%' }} /></div>
                      <span style={{ fontSize: 12, color: '#888' }}>{d.pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}><span style={{ background: d.pct===100?'#EAF3DE':d.pct>0?'#EEEDFE':'#f5f5f5', color: d.pct===100?'#3B6D11':d.pct>0?'#534AB7':'#888', fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 500 }}>{d.pct===100?'مكتمل':d.pct>0?'جاري':'لم يبدأ'}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>لا يوجد بيانات</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
