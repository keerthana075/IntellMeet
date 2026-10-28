export type Page = 'Overview' | 'Meetings' | 'AI Notes' | 'Tasks' | 'Team' | 'Analytics' | 'Settings'

export type User = {
  _id: string
  name: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  authProvider?: 'LOCAL' | 'GOOGLE'
}

export type BackendMeeting = {
  _id: string
  title: string
  description?: string
  host: User | string
  team?: { _id: string; name: string } | string | null
  participants?: Array<User | string>
  scheduledAt?: string | null
  startedAt?: string | null
  endedAt?: string | null
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
}

export type Meeting = {
  id?: string
  title: string
  time: string
  duration: string
  people: string[]
  color: string
  status: string
}
