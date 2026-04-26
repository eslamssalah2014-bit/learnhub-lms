'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { BookOpen, Home, LogOut } from 'lucide-react'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function StudentLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/'); return }
      const { data: p } = await sb.from('profiles').select('*').eq('id', data.user.id).single()
      setUser(p)
    })
  }, [router])

  const nav = [
    { href: '/student', label: 'الرئيسية', icon: Home },
    { href: '/student/courses', label: 'كورساتي', icon: BookOpen },
  ]

  return (
    <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f8' }}>
      <aside style={{ width: 200, background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', padding: '1.5rem 0', flexShrink: 0 }}>
        <div style={{ padding: '0 1.25rem 1rem', fontSize: 18, fontWeight: 600 }}><span style={{ color: '#534AB7' }}>Learn</span>Hub</div>
        {user && (
          <div style={{ padding: '0 1.25rem 1rem', borderBottom: '1px solid #f0f0f0', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#534AB7', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>{(user as any).full_name?.charAt(0)||'؟'}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{(user as any).full_name}</div>
          </div>
        )}
        <nav style={{ flex: 1 }}>
          {nav.map(({ href, label, icon: Icon }) => (
            <button key={href} onClick={() => router.push(href)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1.25rem', width: '100%', border: 'none', background: pathname === href ? '#EEEDFE' : 'transparent', color: pathname === href ? '#534AB7' : '#666', borderRight: pathname === href ? '3px solid #534AB7' : '3px solid transparent', cursor: 'pointer', fontSize: 14, fontWeight: pathname === href ? 500 : 400, textAlign: 'right' }}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>
        <button onClick={async () => { await sb.auth.signOut(); router.push('/') }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 1.25rem', border: 'none', background: 'transparent', color: '#e11d48', cursor: 'pointer', fontSize: 13 }}>
          <LogOut size={15} />خروج
        </button>
      </aside>
      <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto' }}>{children}</main>
    </div>
  )
}
