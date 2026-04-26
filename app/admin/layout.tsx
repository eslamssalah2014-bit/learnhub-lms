'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { LayoutDashboard, BookOpen, Users, BarChart2, Upload, LogOut } from 'lucide-react'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => { if (!data.user) router.push('/') })
  }, [router])

  const nav = [
    { href: '/admin', label: 'الرئيسية', icon: LayoutDashboard },
    { href: '/admin/courses', label: 'الكورسات', icon: BookOpen },
    { href: '/admin/students', label: 'الطلاب', icon: Users },
    { href: '/admin/reports', label: 'الريبورت', icon: BarChart2 },
    { href: '/admin/upload', label: 'رفع محاضرة', icon: Upload },
  ]

  return (
    <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f8' }}>
      <aside style={{ width: 220, background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', padding: '1.5rem 0', flexShrink: 0 }}>
        <div style={{ padding: '0 1.25rem 1.5rem', fontSize: 18, fontWeight: 600 }}>
          <span style={{ color: '#534AB7' }}>Learn</span>Hub
        </div>
        <nav style={{ flex: 1 }}>
          {nav.map(({ href, label, icon: Icon }) => (
            <button key={href} onClick={() => router.push(href)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1.25rem', width: '100%', border: 'none', background: pathname === href ? '#EEEDFE' : 'transparent', color: pathname === href ? '#534AB7' : '#666', borderRight: pathname === href ? '3px solid #534AB7' : '3px solid transparent', cursor: 'pointer', fontSize: 14, fontWeight: pathname === href ? 500 : 400, textAlign: 'right' }}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>
        <button onClick={async () => { await sb.auth.signOut(); router.push('/') }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 1.25rem', border: 'none', background: 'transparent', color: '#e11d48', cursor: 'pointer', fontSize: 13 }}>
          <LogOut size={15} />تسجيل الخروج
        </button>
      </aside>
      <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto' }}>{children}</main>
    </div>
  )
}
