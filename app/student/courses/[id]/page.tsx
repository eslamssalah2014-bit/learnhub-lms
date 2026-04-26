'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, Circle } from 'lucide-react'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function CoursePage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState(null)
  const [lectures, setLectures] = useState([])
  const [completedIds, setCompletedIds] = useState([])
  const [active, setActive] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const [{ data: c }, { data: l }, { data: p }] = await Promise.all([
        sb.from('courses').select('*').eq('id', params.id).single(),
        sb.from('lectures').select('*').eq('course_id', params.id).eq('is_published', true).order('order_index'),
        sb.from('progress').select('lecture_id').eq('user_id', user.id).eq('course_id', params.id).eq('completed', true)
      ])
      setCourse(c); setLectures(l||[]); setCompletedIds((p||[]).map((x: any) => x.lecture_id))
      if (l && l.length > 0) openLecture(l[0])
    }
    load()
  }, [params.id])

  const openLecture = async (lec) => {
    setActive(lec); setVideoUrl('')
    if (lec.video_path) {
      const { data } = await sb.storage.from('videos').createSignedUrl(lec.video_path, 3600)
      if (data) setVideoUrl(data.signedUrl)
    }
  }

  const markDone = async (lecId) => {
    if (completedIds.includes(lecId)) return
    await sb.from('progress').upsert({ user_id: userId, lecture_id: lecId, course_id: params.id, completed: true, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'user_id,lecture_id' })
    setCompletedIds(prev => [...prev, lecId])
  }

  const pct = lectures.length > 0 ? Math.round((completedIds.length / lectures.length) * 100) : 0

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500 }}>{(course as any)?.title_ar}</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>{(course as any)?.title_en}</p>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          {active && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {videoUrl
                ? <video src={videoUrl} controls onEnded={() => markDone((active as any).id)} style={{ width: '100%', display: 'block', background: '#000', borderRadius: '12px 12px 0 0', aspectRatio: '16/9' }} />
                : <div style={{ aspectRatio: '16/9', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 14, borderRadius: '12px 12px 0 0' }}>{(active as any).video_path ? 'جاري التحميل...' : 'لا يوجد فيديو'}</div>
              }
              <div style={{ padding: '1rem 1.25rem' }}>
                <h2 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 6px' }}>{(active as any).title_ar}</h2>
                <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{(active as any).title_en}</p>
                {!completedIds.includes((active as any).id) && (
                  <button onClick={() => markDone((active as any).id)} style={{ marginTop: 14, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#EAF3DE', color: '#3B6D11', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>✓ علّم كمكتملة</button>
                )}
              </div>
            </div>
          )}
        </div>
        <div style={{ width: 260, flexShrink: 0 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>المحاضرات</span>
              <span style={{ fontSize: 12, color: '#888' }}>{completedIds.length}/{lectures.length}</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: '1rem' }}><div className="progress-fill" style={{ width: pct+'%' }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lectures.map((lec: any, i) => {
                const done = completedIds.includes(lec.id)
                const isActive = (active as any)?.id === lec.id
                return (
                  <button key={lec.id} onClick={() => openLecture(lec)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, border: isActive ? '1.5px solid #534AB7' : '1.5px solid transparent', background: isActive ? '#EEEDFE' : done ? '#f0fdf4' : 'transparent', cursor: 'pointer', textAlign: 'right', width: '100%' }}>
                    {done ? <CheckCircle size={16} color="#3B6D11" style={{ flexShrink: 0 }} /> : <Circle size={16} color="#d1d5db" style={{ flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: isActive ? 500 : 400, color: isActive ? '#534AB7' : '#333' }}>{lec.title_ar}</div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>محاضرة {i+1}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
