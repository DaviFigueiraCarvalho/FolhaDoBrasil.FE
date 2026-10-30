import { ScrollViewStyleReset } from 'expo-router/html'
import type { PropsWithChildren } from 'react'

// HTML raiz da exportação web. O script do AdSense fica no <head> de todas as páginas (verificação do
// site); ele só carrega o código do Google, os anúncios em si entram por blocos manuais.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="google-adsense-account" content="ca-pub-4848496352381872" />
        <meta name="google-adsense-account" content="ca-pub-4848496352381872" />
        <ScrollViewStyleReset />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4848496352381872" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
