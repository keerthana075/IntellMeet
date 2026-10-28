// import { useEffect, useMemo, useState } from 'react'
// import type { FormEvent } from 'react'
// import { Sparkles, ChevronDown, Zap, ArrowRight, CircleHelp, ArrowUpRight, MoreHorizontal, Menu, ChevronRight, Search, Bell, Share2, Plus, CalendarPlus, CalendarDays, CheckCheck, X, LogOut } from 'lucide-react'
// import { navItems } from './data/initialData'
// import type { BackendMeeting, Page, Meeting, User } from './types'
// import Avatar from './components/common/Avatar'
// import Overview from './pages/dashboard/Overview'
// import MeetingsPage from './pages/meetings/MeetingsPage'
// import NotesPage from './pages/meetings/NotesPage'
// import TasksPage from './pages/dashboard/TasksPage'
// import TeamPage from './pages/dashboard/TeamPage'
// import AnalyticsPage from './pages/dashboard/AnalyticsPage'
// import SettingsPage from './pages/settings/SettingsPage'
// import AuthPage from './pages/auth/AuthPage'
// import { useAuth } from './auth/AuthContext'
// import { ApiError } from './api/client'
// import { createMeeting as createMeetingRequest, listMeetings } from './api/meetings'
// import LiveMeetingRoom from './pages/meetings/LiveMeetingRoom'

// const meetingColors = ['lavender', 'mint', 'peach', 'blue']

// function initials(name: string) {
//   return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'U'
// }

// function participantInitials(meeting: BackendMeeting) {
//   const users = meeting.participants?.filter((participant): participant is User => typeof participant !== 'string') ?? []
//   if (users.length) return users.map(user => initials(user.name))
//   if (typeof meeting.host !== 'string') return [initials(meeting.host.name)]
//   return ['ME']
// }

// function toUiMeeting(meeting: BackendMeeting, index: number): Meeting {
//   const date = meeting.scheduledAt ? new Date(meeting.scheduledAt) : null
//   return {
//     id: meeting._id,
//     title: meeting.title,
//     time: date && !Number.isNaN(date.getTime())
//       ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//       : 'Not scheduled',
//     duration: meeting.status === 'ENDED' && meeting.startedAt && meeting.endedAt
//       ? `${Math.max(1, Math.round((new Date(meeting.endedAt).getTime() - new Date(meeting.startedAt).getTime()) / 60000))} min`
//       : '30 min',
//     people: participantInitials(meeting),
//     color: meetingColors[index % meetingColors.length],
//     status: meeting.status,
//   }
// }

// export default function App() {
//   const { user, loading: authLoading, logout } = useAuth()
//   const [page, setPage] = useState<Page>('Overview')
//   const [search, setSearch] = useState('')
//   const [showSchedule, setShowSchedule] = useState(false)
//   const [showNotifications, setShowNotifications] = useState(false)
//   const [showProfileMenu, setShowProfileMenu] = useState(false)
//   const [mobileNav, setMobileNav] = useState(false)
//   const [toast, setToast] = useState('')
//   const [meetings, setMeetings] = useState<Meeting[]>([])
//   const [meetingTitle, setMeetingTitle] = useState('')
//   const [meetingDate, setMeetingDate] = useState('')
//   const [meetingTime, setMeetingTime] = useState('')
//   const [completedTasks, setCompletedTasks] = useState<string[]>(['Share Q3 roadmap with team'])
//   const [activeFilter, setActiveFilter] = useState('All meetings')
//   const [meetingLoading, setMeetingLoading] = useState(false)
//   const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null)

//   const notify = (message: string) => {
//     setToast(message)
//     window.setTimeout(() => setToast(''), 2800)
//   }

//   useEffect(() => {
//     if (!user) return
//     let active = true
//     setMeetingLoading(true)
//     listMeetings()
//       .then(items => {
//         if (active) setMeetings(items.map(toUiMeeting))
//       })
//       .catch(err => {
//         if (active) notify(err instanceof ApiError ? err.message : 'Could not load meetings')
//       })
//       .finally(() => {
//         if (active) setMeetingLoading(false)
//       })
//     return () => { active = false }
//   }, [user])

//   const filteredMeetings = useMemo(
//     () => meetings.filter(meeting => meeting.title.toLowerCase().includes(search.toLowerCase())),
//     [meetings, search]
//   )

//   async function createMeeting(event: FormEvent) {
//     event.preventDefault()
//     if (!meetingTitle.trim()) return

//     setMeetingLoading(true)
//     try {
//       const scheduledAt = meetingDate && meetingTime
//         ? new Date(`${meetingDate}T${meetingTime}`).toISOString()
//         : null
//       const created = await createMeetingRequest({
//         title: meetingTitle.trim(),
//         scheduledAt,
//       })
//       setMeetings(current => [toUiMeeting(created, current.length), ...current])
//       setMeetingTitle('')
//       setMeetingDate('')
//       setMeetingTime('')
//       setShowSchedule(false)
//       setPage('Meetings')
//       notify('Meeting scheduled successfully')
//     } catch (err) {
//       notify(err instanceof ApiError ? err.message : 'Could not schedule meeting')
//     } finally {
//       setMeetingLoading(false)
//     }
//   }

//   if (authLoading) return <div className="auth-loading">Restoring your secure session…</div>
//   if (!user) return <AuthPage/>

//   const userInitials = initials(user.name)
//   const firstName = user.name.split(/\s+/)[0] || user.name
//   const pageHeader = {
//     Overview: [`Good to see you, ${firstName} 👋`, 'Here’s what’s happening with your team today.'],
//     Meetings: ['Meetings', 'Plan, join, and revisit your team conversations.'],
//     'AI Notes': ['AI meeting notes', 'Every conversation, turned into clear next steps.'],
//     Tasks: ['Tasks & action items', 'Keep decisions moving after every meeting.'],
//     Team: ['Your team', 'Meet the people making work happen.'],
//     Analytics: ['Meeting analytics', 'Understand your team’s collaboration patterns.'],
//     Settings: ['Settings', 'Manage your workspace preferences.'],
//   }[page]

//   return (
//     <div className="app-shell">
//       <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
//         <div className="brand-row"><div className="brand-mark"><Sparkles size={20} strokeWidth={2.5}/></div><span>intell<span className="brand-light">meet</span></span><button className="icon-button mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
//         <button className="workspace-switch"><span className="workspace-logo">I</span><span className="workspace-text"><b>IntellMeet Workspace</b><small>Team workspace</small></span><ChevronDown size={16}/></button>
//         <div className="nav-label">WORKSPACE</div>
//         <nav>
//           {navItems.filter(i => i.group === 'WORKSPACE').map(item => {
//             const Icon = item.icon
//             return <button key={item.label} className={`nav-item ${page === item.label ? 'active' : ''}`} onClick={() => { setPage(item.label); setMobileNav(false) }}><Icon size={18}/><span>{item.label}</span></button>
//           })}
//           <div className="nav-label manage-label">MANAGE</div>
//           {navItems.filter(i => i.group === 'MANAGE').map(item => {
//             const Icon = item.icon
//             return <button key={item.label} className={`nav-item ${page === item.label ? 'active' : ''}`} onClick={() => { setPage(item.label); setMobileNav(false) }}><Icon size={18}/><span>{item.label}</span></button>
//           })}
//         </nav>
//         <div className="sidebar-bottom">
//           <div className="upgrade-card"><div className="upgrade-icon"><Zap size={16}/></div><b>Make meetings count</b><p>AI intelligence and live collaboration are being connected incrementally.</p><button onClick={() => notify('AI integration is coming in the next production phase')}>Platform roadmap <ArrowRight size={14}/></button><div className="upgrade-orb orb-one"/><div className="upgrade-orb orb-two"/></div>
//           <button className="help-link" onClick={() => notify('Support documentation is being prepared')}><CircleHelp size={17}/> Help & support <ArrowUpRight size={14}/></button>
//           <div className="profile-row"><Avatar initials={userInitials} color="lavender"/><div className="profile-info"><b>{user.name}</b><small>{user.email}</small></div><button className="icon-button" title="Sign out" onClick={() => logout()}><LogOut size={17}/></button></div>
//         </div>
//       </aside>

//       <main className="main-area">
//         <header className="topbar">
//           <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20}/></button>
//           <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><b>{page}</b></div>
//           <div className="top-actions">
//             <label className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search meetings..." /><kbd>⌘ K</kbd></label>
//             <button className={`icon-button notification-button ${showNotifications ? 'selected' : ''}`} onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications"><Bell size={19}/><i/></button>
//             {/* <Avatar initials={userInitials} color="lavender" small/> */}
//             <div className="profile-menu-container">
//   <button
//     className="profile-menu-trigger"
//     onClick={() => setShowProfileMenu(!showProfileMenu)}
//     aria-label="Open profile menu"
//     aria-expanded={showProfileMenu}
//   >
//     <Avatar initials={userInitials} color="lavender" small />
//   </button>

//   {showProfileMenu && (
//     <div className="profile-dropdown">
//       <div className="profile-dropdown-info">
//         <b>{user.name}</b>
//         <small>{user.email}</small>
//       </div>

//       <button
//         className="profile-logout-button"
//         onClick={async () => {
//           setShowProfileMenu(false)
//           await logout()
//         }}
//       >
//         <LogOut size={16} />
//         Sign out
//       </button>
//     </div>
//   )}
// </div>
//           </div>
//           {showNotifications && <div className="notification-popover"><div className="popover-heading"><b>Notifications</b><button onClick={() => setShowNotifications(false)}><X size={16}/></button></div><div className="notification-item"><span className="notification-dot"/><div><b>Secure session active</b><p>Your IntellMeet account is connected to the backend.</p><small>Now</small></div></div></div>}
//         </header>

//         <div className="page-content">
//           <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/>INTELLMEET WORKSPACE</div><h1>{pageHeader[0]}</h1><p>{pageHeader[1]}</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => notify('Team invitations are part of the collaboration phase')}><Share2 size={16}/> Invite team</button><button className="button button-primary" onClick={() => setShowSchedule(true)}><Plus size={17}/> Schedule meeting</button></div></div>

//           {meetingLoading && page === 'Meetings' && <div className="panel empty-state">Syncing meetings…</div>}
//           {page === 'Overview' && <Overview meetings={filteredMeetings} onSchedule={() => setShowSchedule(true)} onNavigate={setPage} onToast={notify} />}
//           {/* {page === 'Meetings' && <MeetingsPage meetings={filteredMeetings} filter={activeFilter} setFilter={setActiveFilter} onSchedule={() => setShowSchedule(true)} onToast={notify}/>} */}
          
//           {page === 'AI Notes' && <NotesPage onToast={notify} search={search}/>}
//           {page === 'Tasks' && <TasksPage completed={completedTasks} setCompleted={setCompletedTasks}/>}
//           {page === 'Team' && <TeamPage onToast={notify}/>}
//           {page === 'Analytics' && <AnalyticsPage/>}
//           {page === 'Settings' && <SettingsPage onToast={notify}/>}
//         </div>
//       </main>

//       {showSchedule && <div className="modal-backdrop" onClick={() => setShowSchedule(false)}><form className="modal-card" onSubmit={createMeeting} onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="modal-icon"><CalendarPlus size={20}/></span><h2>Schedule a meeting</h2><p>Create a persisted meeting in your secure workspace.</p></div><button type="button" className="icon-button" onClick={() => setShowSchedule(false)}><X size={18}/></button></div><label className="field-label">Meeting title<input autoFocus required value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} placeholder="e.g. Product roadmap review"/></label><div className="field-grid"><label className="field-label">Date<input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}/></label><label className="field-label">Start time<input type="time" value={meetingTime} onChange={e => setMeetingTime(e.target.value)}/></label></div><div className="meeting-option"><div className="option-icon"><Sparkles size={17}/></div><div><b>AI meeting assistant</b><small>Will attach to this persisted meeting in the AI phase</small></div><span className="toggle on"><i/></span></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowSchedule(false)}>Cancel</button><button className="button button-primary" type="submit" disabled={meetingLoading}><CalendarDays size={16}/> {meetingLoading ? 'Creating…' : 'Create meeting'}</button></div></form></div>}
//       {toast && <div className="toast"><CheckCheck size={18}/>{toast}<button onClick={() => setToast('')}><X size={15}/></button></div>}
//     </div>
//   )
// }






















import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Sparkles,
  ChevronDown,
  Zap,
  ArrowRight,
  CircleHelp,
  ArrowUpRight,
  Menu,
  ChevronRight,
  Search,
  Bell,
  Share2,
  Plus,
  CalendarPlus,
  CalendarDays,
  CheckCheck,
  X,
  LogOut,
} from 'lucide-react'

import { navItems } from './data/initialData'
import type { BackendMeeting, Page, Meeting, User } from './types'
import Avatar from './components/common/Avatar'
import Overview from './pages/dashboard/Overview'
import MeetingsPage from './pages/meetings/MeetingsPage'
import NotesPage from './pages/meetings/NotesPage'
import TasksPage from './pages/dashboard/TasksPage'
import TeamPage from './pages/dashboard/TeamPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import SettingsPage from './pages/settings/SettingsPage'
import AuthPage from './pages/auth/AuthPage'
import LiveMeetingRoom from './pages/meetings/LiveMeetingRoom'

import { useAuth } from './auth/AuthContext'
import { ApiError } from './api/client'
import {
  createMeeting as createMeetingRequest,
  listMeetings,
} from './api/meetings'

const meetingColors = ['lavender', 'mint', 'peach', 'blue']

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  )
}

function participantInitials(meeting: BackendMeeting) {
  const users =
    meeting.participants?.filter(
      (participant): participant is User =>
        typeof participant !== 'string',
    ) ?? []

  if (users.length) {
    return users.map((user) => initials(user.name))
  }

  if (typeof meeting.host !== 'string') {
    return [initials(meeting.host.name)]
  }

  return ['ME']
}

function toUiMeeting(
  meeting: BackendMeeting,
  index: number,
): Meeting {
  const date = meeting.scheduledAt
    ? new Date(meeting.scheduledAt)
    : null

  return {
    id: meeting._id,
    title: meeting.title,
    time:
      date && !Number.isNaN(date.getTime())
        ? date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Not scheduled',
    duration:
      meeting.status === 'ENDED' &&
      meeting.startedAt &&
      meeting.endedAt
        ? `${Math.max(
            1,
            Math.round(
              (new Date(meeting.endedAt).getTime() -
                new Date(meeting.startedAt).getTime()) /
                60000,
            ),
          )} min`
        : '30 min',
    people: participantInitials(meeting),
    color: meetingColors[index % meetingColors.length],
    status: meeting.status,
  }
}

export default function App() {
  const { user, loading: authLoading, logout } = useAuth()

  const [page, setPage] = useState<Page>('Overview')
  const [search, setSearch] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')

  const [completedTasks, setCompletedTasks] = useState<string[]>([
    'Share Q3 roadmap with team',
  ])

  const [activeFilter, setActiveFilter] = useState('All meetings')
  const [meetingLoading, setMeetingLoading] = useState(false)

  // A non-null value means the live meeting room is open.
  const [activeMeeting, setActiveMeeting] =
    useState<Meeting | null>(null)

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  // Load meetings for the signed-in user.
  useEffect(() => {
    if (!user) return

    let active = true

    setMeetingLoading(true)

    listMeetings()
      .then((items) => {
        if (active) {
          setMeetings(items.map(toUiMeeting))
        }
      })
      .catch((err) => {
        if (active) {
          notify(
            err instanceof ApiError
              ? err.message
              : 'Could not load meetings',
          )
        }
      })
      .finally(() => {
        if (active) {
          setMeetingLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [user])

  const filteredMeetings = useMemo(
    () =>
      meetings.filter((meeting) =>
        meeting.title
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [meetings, search],
  )

  async function createMeeting(event: FormEvent) {
    event.preventDefault()

    if (!meetingTitle.trim()) return

    setMeetingLoading(true)

    try {
      const scheduledAt =
        meetingDate && meetingTime
          ? new Date(
              `${meetingDate}T${meetingTime}`,
            ).toISOString()
          : null

      const created = await createMeetingRequest({
        title: meetingTitle.trim(),
        scheduledAt,
      })

      setMeetings((current) => [
        toUiMeeting(created, current.length),
        ...current,
      ])

      setMeetingTitle('')
      setMeetingDate('')
      setMeetingTime('')
      setShowSchedule(false)
      setPage('Meetings')

      notify('Meeting scheduled successfully')
    } catch (err) {
      notify(
        err instanceof ApiError
          ? err.message
          : 'Could not schedule meeting',
      )
    } finally {
      setMeetingLoading(false)
    }
  }

  function openMeeting(meeting: Meeting) {
    if (!meeting.id) {
      notify('This meeting has no valid meeting ID.')
      return
    }

    if (
      meeting.status === 'ENDED' ||
      meeting.status === 'Completed' ||
      meeting.status === 'CANCELLED'
    ) {
      notify('This meeting is no longer available to join.')
      return
    }

    setActiveMeeting(meeting)
  }

  function leaveMeeting() {
    setActiveMeeting(null)
    notify('You left the meeting')
  }

  if (authLoading) {
    return (
      <div className="auth-loading">
        Restoring your secure session…
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const userInitials = initials(user.name)
  const firstName = user.name.split(/\s+/)[0] || user.name

  const pageHeader = {
    Overview: [
      `Good to see you, ${firstName} 👋`,
      'Here’s what’s happening with your team today.',
    ],
    Meetings: [
      'Meetings',
      'Plan, join, and revisit your team conversations.',
    ],
    'AI Notes': [
      'AI meeting notes',
      'Every conversation, turned into clear next steps.',
    ],
    Tasks: [
      'Tasks & action items',
      'Keep decisions moving after every meeting.',
    ],
    Team: [
      'Your team',
      'Meet the people making work happen.',
    ],
    Analytics: [
      'Meeting analytics',
      'Understand your team’s collaboration patterns.',
    ],
    Settings: [
      'Settings',
      'Manage your workspace preferences.',
    ],
  }[page]

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${
          mobileNav ? 'sidebar-open' : ''
        }`}
      >
        <div className="brand-row">
          <div className="brand-mark">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>

          <span>
            intell<span className="brand-light">meet</span>
          </span>

          <button
            className="icon-button mobile-close"
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <button className="workspace-switch">
          <span className="workspace-logo">I</span>

          <span className="workspace-text">
            <b>IntellMeet Workspace</b>
            <small>Team workspace</small>
          </span>

          <ChevronDown size={16} />
        </button>

        <div className="nav-label">WORKSPACE</div>

        <nav>
          {navItems
            .filter((item) => item.group === 'WORKSPACE')
            .map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.label}
                  className={`nav-item ${
                    page === item.label ? 'active' : ''
                  }`}
                  onClick={() => {
                    setPage(item.label)
                    setMobileNav(false)
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}

          <div className="nav-label manage-label">
            MANAGE
          </div>

          {navItems
            .filter((item) => item.group === 'MANAGE')
            .map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.label}
                  className={`nav-item ${
                    page === item.label ? 'active' : ''
                  }`}
                  onClick={() => {
                    setPage(item.label)
                    setMobileNav(false)
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <Zap size={16} />
            </div>

            <b>Make meetings count</b>

            <p>
              AI intelligence and live collaboration are being
              connected incrementally.
            </p>

            <button
              onClick={() =>
                notify(
                  'AI integration is coming in the next production phase',
                )
              }
            >
              Platform roadmap <ArrowRight size={14} />
            </button>

            <div className="upgrade-orb orb-one" />
            <div className="upgrade-orb orb-two" />
          </div>

          <button
            className="help-link"
            onClick={() =>
              notify('Support documentation is being prepared')
            }
          >
            <CircleHelp size={17} />
            Help & support
            <ArrowUpRight size={14} />
          </button>

          <div className="profile-row">
            <Avatar
              initials={userInitials}
              color="lavender"
            />

            <div className="profile-info">
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>

            <button
              className="icon-button"
              title="Sign out"
              onClick={() => void logout()}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <b>{activeMeeting ? 'Live meeting' : page}</b>
          </div>

          {!activeMeeting && (
            <div className="top-actions">
              <label className="search-box">
                <Search size={17} />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search meetings..."
                />

                <kbd>⌘ K</kbd>
              </label>

              <button
                className={`icon-button notification-button ${
                  showNotifications ? 'selected' : ''
                }`}
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
                aria-label="Notifications"
              >
                <Bell size={19} />
                <i />
              </button>

              <div className="profile-menu-container">
                <button
                  className="profile-menu-trigger"
                  onClick={() =>
                    setShowProfileMenu(!showProfileMenu)
                  }
                  aria-label="Open profile menu"
                  aria-expanded={showProfileMenu}
                >
                  <Avatar
                    initials={userInitials}
                    color="lavender"
                    small
                  />
                </button>

                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-info">
                      <b>{user.name}</b>
                      <small>{user.email}</small>
                    </div>

                    <button
                      className="profile-logout-button"
                      onClick={async () => {
                        setShowProfileMenu(false)
                        await logout()
                      }}
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {showNotifications && !activeMeeting && (
            <div className="notification-popover">
              <div className="popover-heading">
                <b>Notifications</b>

                <button
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="notification-item">
                <span className="notification-dot" />

                <div>
                  <b>Secure session active</b>
                  <p>
                    Your IntellMeet account is connected to
                    the backend.
                  </p>
                  <small>Now</small>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="page-content">
          {activeMeeting ? (
            <LiveMeetingRoom
              meetingId={activeMeeting.id!}
              title={activeMeeting.title}
              onLeave={leaveMeeting}
            />
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-dot" />
                    INTELLMEET WORKSPACE
                  </div>

                  <h1>{pageHeader[0]}</h1>
                  <p>{pageHeader[1]}</p>
                </div>

                <div className="heading-actions">
                  <button
                    className="button button-secondary"
                    onClick={() =>
                      notify(
                        'Team invitations are part of the collaboration phase',
                      )
                    }
                  >
                    <Share2 size={16} />
                    Invite team
                  </button>

                  <button
                    className="button button-primary"
                    onClick={() => setShowSchedule(true)}
                  >
                    <Plus size={17} />
                    Schedule meeting
                  </button>
                </div>
              </div>

              {meetingLoading && page === 'Meetings' && (
                <div className="panel empty-state">
                  Syncing meetings…
                </div>
              )}

              {page === 'Overview' && (
                <Overview
                  meetings={filteredMeetings}
                  onSchedule={() => setShowSchedule(true)}
                  onNavigate={setPage}
                  onToast={notify}
                />
              )}

              {page === 'Meetings' && (
                <MeetingsPage
                  meetings={filteredMeetings}
                  filter={activeFilter}
                  setFilter={setActiveFilter}
                  onSchedule={() => setShowSchedule(true)}
                  onToast={notify}
                  onJoin={openMeeting}
                />
              )}

              {page === 'AI Notes' && (
                <NotesPage
                  onToast={notify}
                  search={search}
                />
              )}

              {page === 'Tasks' && (
                <TasksPage
                  completed={completedTasks}
                  setCompleted={setCompletedTasks}
                />
              )}

              {page === 'Team' && (
                <TeamPage onToast={notify} />
              )}

              {page === 'Analytics' && <AnalyticsPage />}

              {page === 'Settings' && (
                <SettingsPage onToast={notify} />
              )}
            </>
          )}
        </div>
      </main>

      {!activeMeeting && showSchedule && (
        <div
          className="modal-backdrop"
          onClick={() => setShowSchedule(false)}
        >
          <form
            className="modal-card"
            onSubmit={createMeeting}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="modal-icon">
                  <CalendarPlus size={20} />
                </span>

                <h2>Schedule a meeting</h2>

                <p>
                  Create a persisted meeting in your secure
                  workspace.
                </p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setShowSchedule(false)}
                aria-label="Close schedule form"
              >
                <X size={18} />
              </button>
            </div>

            <label className="field-label">
              Meeting title
              <input
                autoFocus
                required
                value={meetingTitle}
                onChange={(event) =>
                  setMeetingTitle(event.target.value)
                }
                placeholder="e.g. Product roadmap review"
              />
            </label>

            <div className="field-grid">
              <label className="field-label">
                Date
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(event) =>
                    setMeetingDate(event.target.value)
                  }
                />
              </label>

              <label className="field-label">
                Start time
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(event) =>
                    setMeetingTime(event.target.value)
                  }
                />
              </label>
            </div>

            <div className="meeting-option">
              <div className="option-icon">
                <Sparkles size={17} />
              </div>

              <div>
                <b>AI meeting assistant</b>
                <small>
                  Will attach to this persisted meeting in
                  the AI phase
                </small>
              </div>

              <span className="toggle on">
                <i />
              </span>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowSchedule(false)}
              >
                Cancel
              </button>

              <button
                className="button button-primary"
                type="submit"
                disabled={meetingLoading}
              >
                <CalendarDays size={16} />
                {meetingLoading
                  ? 'Creating…'
                  : 'Create meeting'}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="toast">
          <CheckCheck size={18} />
          {toast}

          <button
            onClick={() => setToast('')}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
