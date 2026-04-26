'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Trash2 } from 'lucide-react'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title_ar: '', title_en: '', description_ar: '', description_en: '' })
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const { data } = await sb.from('courses').select('*, lectures(id), enrollments(id)').order('created_at', { ascending: false })
    setCourses(data || [])
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    setLoading(true)
    const { data: { user } } = await sb.auth.getUser()
    await sb.from('courses').insert({ ...form, is_published: true, created_by: user?.id })
    setForm({ title_ar: '', title_en: '', description_ar: '', description_en: '' })
    setShow(false); setLoading(false); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>الكورسات ({courses.length})</h1>
        <button onClick={() => setShow(!show)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} />إضافة كورس</button>
      </div>
      {show && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {[['title_ar','العنوان بالعربي'],['title_en','Title (English)'],['description_ar','الوصف بالعربي'],['description_en','Description (English)']].map(([k,l]) => (
              <div key={k}>
                <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>{l}</label>
                <input value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShow(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13 }}>إلغاء</button>
            <button onClick={save} disabled={loading || !form.title_ar} className="btn-primary">{loading ? '...' : 'حفظ'}</button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        {courses.map((c: any) => (
          <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📚</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{c.title_ar}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{c.title_en}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{c.lectures?.length||0} محاضرة · {c.enrollments?.length||0} طالب</div>
            </div>
            <button onClick={async () => { if(confirm('حذف الكورس؟')) { await sb.from('courses').delete().eq('id',c.id); load() } }} style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer' }}><Trash2 size={15} /></button>
          </div>
        ))}
        {courses.length === 0 && <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', padding: '2rem' }}>لا يوجد كورسات بعد</p>}
      </div>
    </div>
  )
}
