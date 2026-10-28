import type { ReactNode } from 'react'
type BadgeProps = { children: ReactNode; tone?: string }
export default function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`badge ${tone}`}>{children}</span>
}
