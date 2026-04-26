'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    if (mode === 'login') {
      const { data, error } = await sb.auth.signInWithPassword({ email: form.email, password: form.password })
      if (error) { setError(error.message); setLoading(false); return }
      const { data: p } = await sb.from('profiles').select('role').eq('id', data.user.id).single()
      router.push(p?.role === 'admin' ? '/admin' : '/student')
    } else {
      const { error } = await sb.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name, role: 'student' } } })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/student')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '2.5rem', width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#534AB7', marginBottom: '1.5rem' }}>LearnHub 🎓</h1>
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: '#f5f5f5', borderRadius: 8, padding: 4 }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: mode === m ? 'white' : 'transparent', color: mode === m ? '#534AB7' : '#888', cursor: 'pointer', fontWeight: mode === m ? 500 : 400, fontSize: 14 }}>
              {m === 'login' ? 'تسجيل الدخول' : 'حساب جديد'}
            </button>
          ))}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="الاسم الكامل" required style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }} />}
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="البريد الإلكتروني" required style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }} />
          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="كلمة المرور" required style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }} />
          {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: 12, fontSize: 15, borderRadius: 8, marginTop: 4 }}>
            {loading ? '...' : mode === 'login' ? 'دخول' : 'إنشاء حساب'}
          </button>
        </form>
      </div>
    </div>
  )
}
