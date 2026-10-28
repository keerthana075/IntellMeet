import type { ReactNode } from 'react'
type SectionTitleProps = { title: string; subtitle?: string; action?: ReactNode }
export default function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return <div className="section-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
}
