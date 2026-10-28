// import { Filter, CalendarDays, MoreHorizontal, Video, Clock3, Sparkles, ArrowRight, Plus } from 'lucide-react'
// import Avatar from '../../components/common/Avatar'
// import Badge from '../../components/common/Badge'
// import type { Page, Meeting } from '../../types'

// export default function MeetingsPage({ meetings, filter, setFilter, onSchedule, onToast }: { meetings: Meeting[]; filter: string; setFilter: (s:string)=>void; onSchedule:()=>void; onToast:(s:string)=>void }) {
//   const visible = filter === 'All meetings' ? meetings : meetings.filter(m => filter === 'Upcoming' ? m.status !== 'Completed' : m.status === 'Completed')
//   return <><div className="filter-toolbar"><div className="segmented">{['All meetings','Upcoming','Completed'].map(f=><button key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f}</button>)}</div><button className="button button-secondary" onClick={() => onToast('Calendar filter options opened')}><Filter size={15}/> Filter</button></div><div className="meeting-cards">{visible.map((m,i)=><div className="meeting-card" key={m.title}><div className={`meeting-card-banner ${m.color}`}><div className="banner-date"><CalendarDays size={16}/><span>OCT 13, 2026</span></div><button className="icon-button" onClick={() => onToast('Meeting menu opened')}><MoreHorizontal size={18}/></button><div className="banner-illustration"><Video size={48}/></div></div><div className="meeting-card-body"><Badge tone={i===0?'violet':'neutral'}>{m.status}</Badge><h3>{m.title}</h3><p><Clock3 size={14}/>{m.time} · {m.duration}</p><div className="card-footer"><div className="avatar-stack">{m.people.map((p,j)=><Avatar key={j} initials={p} small color={['lavender','mint','peach','blue'][j%4]}/>)}</div><span className="muted-text">{m.people.length} participants</span><button className="button button-primary button-small" onClick={() => onToast(`Joining "${m.title}" — connect your meeting API to enable live rooms`)}><Video size={14}/> Join</button></div></div></div>)}</div>{visible.length===0&&<div className="panel empty-state">No meetings found for this filter.</div>}<div className="panel meeting-tip"><span className="tip-icon"><Sparkles size={18}/></span><div><b>Make every meeting count</b><p>Enable AI meeting assistant to get transcripts, summaries, and assigned action items automatically.</p></div><button className="text-button" onClick={() => onToast('AI assistant settings opened')}>Configure AI <ArrowRight size={14}/></button></div><button className="floating-add" onClick={onSchedule}><Plus size={18}/></button></>
// }

















import {
  Filter,
  CalendarDays,
  MoreHorizontal,
  Video,
  Clock3,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react'

import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import type { Meeting } from '../../types'

type MeetingsPageProps = {
  meetings: Meeting[]
  filter: string
  setFilter: (filter: string) => void
  onSchedule: () => void
  onToast: (message: string) => void
  onJoin: (meeting: Meeting) => void
}

export default function MeetingsPage({
  meetings,
  filter,
  setFilter,
  onSchedule,
  onToast,
  onJoin,
}: MeetingsPageProps) {
  const visible =
    filter === 'All meetings'
      ? meetings
      : meetings.filter((meeting) =>
          filter === 'Upcoming'
            ? meeting.status !== 'Completed' && meeting.status !== 'ENDED'
            : meeting.status === 'Completed' || meeting.status === 'ENDED',
        )

  function handleJoin(meeting: Meeting) {
    if (!meeting.id) {
      onToast('Unable to join: this meeting has no valid meeting ID.')
      return
    }

    onJoin(meeting)
  }

  return (
    <>
      <div className="filter-toolbar">
        <div className="segmented">
          {['All meetings', 'Upcoming', 'Completed'].map((item) => (
            <button
              key={item}
              className={filter === item ? 'selected' : ''}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <button
          className="button button-secondary"
          onClick={() => onToast('Calendar filter options opened')}
        >
          <Filter size={15} />
          Filter
        </button>
      </div>

      <div className="meeting-cards">
        {visible.map((meeting, index) => (
          <div className="meeting-card" key={meeting.id ?? meeting.title}>
            <div className={`meeting-card-banner ${meeting.color}`}>
              <div className="banner-date">
                <CalendarDays size={16} />
                <span>{meeting.time}</span>
              </div>

              <button
                className="icon-button"
                aria-label={`More options for ${meeting.title}`}
                onClick={() => onToast('Meeting menu opened')}
              >
                <MoreHorizontal size={18} />
              </button>

              <div className="banner-illustration">
                <Video size={48} />
              </div>
            </div>

            <div className="meeting-card-body">
              <Badge tone={index === 0 ? 'violet' : 'neutral'}>
                {meeting.status}
              </Badge>

              <h3>{meeting.title}</h3>

              <p>
                <Clock3 size={14} />
                {meeting.time} · {meeting.duration}
              </p>

              <div className="card-footer">
                <div className="avatar-stack">
                  {meeting.people.map((person, personIndex) => (
                    <Avatar
                      key={`${meeting.id ?? meeting.title}-${personIndex}`}
                      initials={person}
                      small
                      color={
                        ['lavender', 'mint', 'peach', 'blue'][
                          personIndex % 4
                        ]
                      }
                    />
                  ))}
                </div>

                <span className="muted-text">
                  {meeting.people.length} participants
                </span>

                <button
                  className="button button-primary button-small"
                  onClick={() => handleJoin(meeting)}
                  disabled={
                    meeting.status === 'ENDED' ||
                    meeting.status === 'Completed' ||
                    meeting.status === 'CANCELLED'
                  }
                  title={
                    meeting.status === 'ENDED' ||
                    meeting.status === 'Completed' ||
                    meeting.status === 'CANCELLED'
                      ? 'This meeting is not available to join'
                      : 'Join meeting'
                  }
                >
                  <Video size={14} />
                  Join
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="panel empty-state">
          No meetings found for this filter.
        </div>
      )}

      <div className="panel meeting-tip">
        <span className="tip-icon">
          <Sparkles size={18} />
        </span>

        <div>
          <b>Make every meeting count</b>
          <p>
            Enable AI meeting assistant to get transcripts, summaries, and
            assigned action items automatically.
          </p>
        </div>

        <button
          className="text-button"
          onClick={() => onToast('AI assistant settings opened')}
        >
          Configure AI <ArrowRight size={14} />
        </button>
      </div>

      <button
        className="floating-add"
        onClick={onSchedule}
        aria-label="Schedule a meeting"
      >
        <Plus size={18} />
      </button>
    </>
  )
}
