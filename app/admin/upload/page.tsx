'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Upload, CheckCircle } from 'lucide-react'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function UploadPage() {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({ course_id: '', title_ar: '', title_en: '', order_index: 1 })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)

  useEffect(() => { sb.from('courses').select('id,title_ar').then(({ data }) => setCourses(data || [])) }, [])

  const upload = async () => {
    if (!form.course_id || !form.title_ar || !file) { setError('اختار الكورس وحط العنوان والفيديو'); return }
    setError(''); setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${form.course_id}/${Date.now()}.${ext}`
    const { error: e } = await sb.storage.from('videos').upload(path, file)
    if (e) { setError(e.message); setUploading(false); return }
    await sb.from('lectures').insert({ course_id: form.course_id, title_ar: form.title_ar, title_en: form.title_en, video_path: path, order_index: form.order_index, is_published: true })
    setDone(true); setUploading(false)
    setTimeout(() => { setDone(false); setForm({ course_id: '', title_ar: '', title_en: '', order_index: 1 }); setFile(null) }, 3000)
  }

  if (done) return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}><CheckCircle size={60} color="#3B6D11" /><h2 style={{ color: '#3B6D11' }}>تم الرفع بنجاح!</h2></div>

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: '1.5rem' }}>رفع محاضرة جديدة</h1>
      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>الكورس *</label>
          <select value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}>
            <option value="">اختار الكورس</option>
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title_ar}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {[['title_ar','عنوان المحاضرة (عربي) *'],['title_en','Lecture Title (English)']].map(([k,l]) => (
            <div key={k}>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>{l}</label>
              <input value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>ترتيب المحاضرة</label>
          <input type="number" min={1} value={form.order_index} onChange={e => setForm({...form, order_index: parseInt(e.target.value)})} style={{ width: 100, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
        </div>
        <div onClick={() => ref.current?.click()} style={{ border: '2px dashed #d1d5db', borderRadius: 12, padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: file ? '#f0fdf4' : 'transparent' }}>
          <Upload size={28} color={file ? '#3B6D11' : '#aaa'} style={{ margin: '0 auto 8px' }} />
          {file ? <div style={{ fontWeight: 500, color: '#3B6D11' }}>{file.name}</div> : <div><div style={{ fontWeight: 500, fontSize: 14 }}>اسحب الفيديو هنا أو اضغط للاختيار</div><div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>MP4, MOV — حد أقصى 2GB</div></div>}
          <input ref={ref} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>
        {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={upload} disabled={uploading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Upload size={15} />{uploading ? 'جاري الرفع...' : 'رفع المحاضرة'}
          </button>
        </div>
      </div>
    </div>
  )
}
