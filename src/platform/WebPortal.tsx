import type { ReactNode } from 'react'

/** Nativo: não há overlay por hover (sem mouse), então não renderiza nada. Ver WebPortal.web.tsx. */
export default function WebPortal(_props: { children: ReactNode }): null {
  return null
}
