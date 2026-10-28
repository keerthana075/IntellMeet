import { LayoutDashboard, Video, Sparkles, ListTodo, Users, BarChart3, Settings } from 'lucide-react'
import type { Page, Meeting } from '../types'

export const initialMeetings: Meeting[] = [
  { title: 'Product design sync', time: '09:30 AM', duration: '30 min', people: ['AM', 'JL', 'SK'], color: 'lavender', status: 'Starting soon' },
  { title: 'Sprint planning', time: '11:00 AM', duration: '45 min', people: ['SK', 'RK', 'AM', 'JL'], color: 'mint', status: 'In 1 hour' },
  { title: 'Marketing weekly review', time: '02:30 PM', duration: '30 min', people: ['JL', 'RK'], color: 'peach', status: 'Today' },
]
export const navItems: { label: Page; icon: typeof LayoutDashboard; group: string }[] = [
  { label: 'Overview', icon: LayoutDashboard, group: 'WORKSPACE' },
  { label: 'Meetings', icon: Video, group: 'WORKSPACE' },
  { label: 'AI Notes', icon: Sparkles, group: 'WORKSPACE' },
  { label: 'Tasks', icon: ListTodo, group: 'WORKSPACE' },
  { label: 'Team', icon: Users, group: 'MANAGE' },
  { label: 'Analytics', icon: BarChart3, group: 'MANAGE' },
  { label: 'Settings', icon: Settings, group: 'MANAGE' },
]
export const notes = [
  { title: 'Q3 product roadmap', date: 'Today · 10:42 AM', tag: 'Product', summary: 'The team agreed to prioritize onboarding improvements and the new workspace experience. Design review is scheduled for Thursday.', tasks: 4, initials: 'PR', tone: 'violet' },
  { title: 'Customer success check-in', date: 'Yesterday · 3:18 PM', tag: 'Customer success', summary: 'Top customer requests include clearer reporting, faster exports, and more flexible team permissions.', tasks: 3, initials: 'CS', tone: 'green' },
  { title: 'Engineering stand-up', date: 'Yesterday · 9:30 AM', tag: 'Engineering', summary: 'API pagination is ready for review. The team will resolve two UI bugs before the next release candidate.', tasks: 2, initials: 'EN', tone: 'orange' },
]
export const tasks = [
  { title: 'Finalize onboarding wireframes', owner: 'Alex Morgan', due: 'Today', status: 'In progress', tone: 'violet' },
  { title: 'Review API pagination PR', owner: 'Jordan Lee', due: 'Today', status: 'To do', tone: 'blue' },
  { title: 'Share Q3 roadmap with team', owner: 'Sam Kim', due: 'Tomorrow', status: 'Done', tone: 'green' },
  { title: 'Prepare customer feedback report', owner: 'Riya Kapoor', due: 'Oct 16', status: 'To do', tone: 'orange' },
]
export const people = [
  { name: 'Alex Morgan', role: 'Product Designer', initials: 'AM', color: 'lavender', online: true },
  { name: 'Jordan Lee', role: 'Engineering Lead', initials: 'JL', color: 'mint', online: true },
  { name: 'Sam Kim', role: 'Product Manager', initials: 'SK', color: 'peach', online: false },
  { name: 'Riya Kapoor', role: 'Marketing Lead', initials: 'RK', color: 'blue', online: true },
]
