import { useState } from 'react'
import { Users, Bell, Sparkles, Settings } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'

export default function SettingsPage({onToast}:{onToast:(s:string)=>void}) {
  const [ai, setAi] = useState(true)
  const [transcript, setTranscript] = useState(true)
  const [reminders, setReminders] = useState(false)
  return <div className="settings-layout"><div className="settings-nav panel"><button className="active"><Users size={16}/> Workspace profile</button><button><Bell size={16}/> Notifications</button><button><Sparkles size={16}/> AI preferences</button><button><ShieldIcon/> Security & access</button></div><section className="panel settings-panel"><div className="panel-heading"><div><h3>Workspace profile</h3><p>Update your workspace details and preferences.</p></div></div><div className="workspace-profile"><span className="workspace-logo big">N</span><div><b>Northstar Studio</b><small>Workspace avatar</small></div><button className="button button-secondary button-small" onClick={()=>onToast('Avatar upload is not connected in this demo')}>Change avatar</button></div><label className="field-label">Workspace name<input defaultValue="Northstar Studio"/></label><label className="field-label">Workspace URL<div className="url-input"><span>intellmeet.app/</span><input defaultValue="northstar-studio"/></div></label><div className="settings-divider"/><h3 className="settings-subtitle">AI & meeting preferences</h3><SettingToggle title="AI meeting assistant" description="Automatically generate summaries and action items." value={ai} onChange={setAi}/><SettingToggle title="Meeting transcription" description="Create a searchable transcript for recorded meetings." value={transcript} onChange={setTranscript}/><SettingToggle title="Meeting reminders" description="Get notified 10 minutes before a meeting starts." value={reminders} onChange={setReminders}/><div className="settings-save"><span>Changes are saved locally in this demo.</span><button className="button button-primary" onClick={()=>onToast('Preferences saved')}>Save changes</button></div></section></div>
}
function ShieldIcon(){return <Settings size={16}/>}
function SettingToggle({title,description,value,onChange}:{title:string;description:string;value:boolean;onChange:(v:boolean)=>void}) {
  
  return (
    <div className="setting-toggle-row">
      <div>
        <b>{title}</b>
        <p>{description}</p>
      </div>
      <button
        className={`toggle ${value ? 'on' : ''}`}
        onClick={() => onChange(!value)}
        aria-label={`Toggle ${title}`}
      >
        <i />
      </button>
    </div>
  )
}
