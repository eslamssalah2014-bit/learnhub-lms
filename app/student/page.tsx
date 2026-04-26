'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function StudentHome() {
  const router = useRouter()
  const [enrollments, setEnrollments] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single()
      setUser(p)
      const { data: enr } = await sb.from('enrollments').select('*, courses(*, lectures(id))').eq('user_id', user.id)
      const enriched = await Promise.all((enr||[]).map(async en => {
        const { count } = await sb.from('progress').select('id',{count:'exact'}).eq('user_id',user.id).eq('course_id',en.course_id).eq('completed',true)
        const total = en.courses?.lectures?.length || 0
        return { ...en, done: count||0, total, pct: total > 0 ? Math.round(((count||0)/total)*100) : 0 }
      }))
      setEnrollments(enriched)
    }
    load()
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>أهلاً {(user as any)?.full_name} 👋</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: '1.5rem' }}>استمر في التعلم!</p>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: '1rem' }}>كورساتك</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
        {enrollments.map((en: any) => (
          <div key={en.id} onClick={() => router.push(`/student/courses/${en.course_id}`)} className="card" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📚</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{en.courses?.title_ar}</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{en.done}/{en.total} محاضرة</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: en.pct+'%' }} /></div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>{en.pct}%</div>
          </div>
        ))}
        {enrollments.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
            <div style={{ marginBottom: 12 }}>لم تسجل في أي كورس بعد</div>
            <button onClick={() => router.push('/student/courses')} className="btn-primary">اشترك في كورس</button>
          </div>
        )}
      </div>
    </div>
  )
}
