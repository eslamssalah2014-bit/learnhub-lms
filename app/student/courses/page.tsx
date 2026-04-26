'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function StudentCourses() {
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const [{ data: c }, { data: e }] = await Promise.all([
        sb.from('courses').select('*, lectures(id)').eq('is_published', true),
        sb.from('enrollments').select('course_id').eq('user_id', user.id)
      ])
      setCourses(c||[]); setEnrolledIds((e||[]).map((x: any) => x.course_id))
    }
    load()
  }, [])

  const enroll = async (courseId) => {
    setLoading(courseId)
    await sb.from('enrollments').insert({ user_id: userId, course_id: courseId })
    setEnrolledIds(prev => [...prev, courseId]); setLoading('')
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: '1.5rem' }}>كل الكورسات</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
        {courses.map((c: any) => {
          const enrolled = enrolledIds.includes(c.id)
          return (
            <div key={c.id} className="card">
              <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{c.title_ar}</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{c.title_en}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 14 }}>{c.lectures?.length||0} محاضرة</div>
              {enrolled
                ? <button onClick={() => router.push(`/student/courses/${c.id}`)} style={{ width: '100%', padding: 9, borderRadius: 8, border: 'none', background: '#EEEDFE', color: '#534AB7', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>متابعة الكورس →</button>
                : <button onClick={() => enroll(c.id)} disabled={loading === c.id} className="btn-primary" style={{ width: '100%', padding: 9, fontSize: 13 }}>{loading === c.id ? '...' : 'اشترك الآن'}</button>
              }
            </div>
          )
        })}
        {courses.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>لا يوجد كورسات بعد</p>}
      </div>
    </div>
  )
}
