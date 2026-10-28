type AvatarProps = { initials: string; color?: string; small?: boolean }
export default function Avatar({ initials, color = 'lavender', small = false }: AvatarProps) {
  return <span className={`avatar ${color} ${small ? 'avatar-sm' : ''}`}>{initials}</span>
}
