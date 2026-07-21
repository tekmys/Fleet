import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

interface NavSection {
  sectionLabel?: string
  items: NavItem[]
}

const BookIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const HomeIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
)

const ChatIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

const navSectionsByRole: Record<string, NavSection[]> = {
  ADMIN: [
    {
      sectionLabel: 'Portal Entry',
      items: [
        { label: 'Dashboard', to: '/admin/dashboard', icon: <HomeIcon /> },
      ],
    },
    {
      sectionLabel: 'Administration',
      items: [
        { label: 'User Directory', to: '/admin/users', icon: <UsersIcon /> },
        { label: 'Course Catalog', to: '/admin/courses', icon: <BookIcon /> },
      ],
    },
    {
      sectionLabel: 'Campus Services',
      items: [
        { label: 'Academic Calendar', to: '/admin/calendar', icon: <CalendarIcon /> },
        { label: 'Student Messages', to: '/admin/messages', icon: <ChatIcon /> },
      ],
    },
  ],
  LECTURER: [
    {
      sectionLabel: 'Portal Entry',
      items: [
        { label: 'Dashboard', to: '/lecturer/dashboard', icon: <HomeIcon /> },
      ],
    },
    {
      sectionLabel: 'Teaching',
      items: [
        { label: 'My Courses', to: '/lecturer/courses', icon: <BookIcon /> },
        { label: 'Course Calendar', to: '/lecturer/calendar', icon: <CalendarIcon /> },
      ],
    },
    {
      sectionLabel: 'Services',
      items: [
        { label: 'Inbound Inbox', to: '/lecturer/messages', icon: <ChatIcon /> },
      ],
    },
  ],
  STUDENT: [
    {
      sectionLabel: 'Portal Entry',
      items: [
        { label: 'Student Dashboard', to: '/student/dashboard', icon: <HomeIcon /> },
      ],
    },
    {
      sectionLabel: 'Academics',
      items: [
        { label: 'My Courses', to: '/student/courses', icon: <BookIcon /> },
        { label: 'Term Calendar', to: '/student/calendar', icon: <CalendarIcon /> },
      ],
    },
    {
      sectionLabel: 'Communication',
      items: [
        { label: 'Portal Messages', to: '/student/messages', icon: <ChatIcon /> },
      ],
    },
  ],
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const sections = navSectionsByRole[user?.role ?? ''] ?? []

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-slate-300 px-4 py-6 border-r border-slate-800">
      
      {/* University Brand Header */}
      <div className="flex items-center gap-3 px-3 mb-8 select-none">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center border border-indigo-500/30">
          <span className="text-white text-xs font-extrabold tracking-wider">AI</span>
        </div>
        <div>
          <h1 className="font-extrabold text-white text-base leading-none tracking-wider">AI</h1>
          <span className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase leading-none block mt-0.5">LMS</span>
        </div>
      </div>

      {/* Nav Section Groups */}
      <nav className="flex-1 flex flex-col gap-5 overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            {section.sectionLabel && (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1">
                {section.sectionLabel}
              </div>
            )}
            
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150',
                      isActive
                        ? 'bg-slate-800 text-white border-l-2 border-indigo-400'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
                    ].join(' ')
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile capsule at footer */}
      {user && (
        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 border border-indigo-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">{user.name}</p>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">{user.role}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
