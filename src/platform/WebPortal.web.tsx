import type { ReactNode } from 'react'
// `react-dom` não tem tipos instalados neste projeto (@types/react-dom conflita com os peers do Expo),
// então tipamos só o que usamos. Este arquivo só entra no bundle web.
// @ts-expect-error sem declaração de tipos para react-dom
import { createPortal as untypedCreatePortal } from 'react-dom'

const createPortal = untypedCreatePortal as (children: ReactNode, container: Element) => ReactNode

/** Renderiza os filhos direto no <body> (web), para que `position: fixed` cubra a janela toda. */
export default function WebPortal({ children }: { children: ReactNode }) {
  return <>{createPortal(children, document.body)}</>
}
