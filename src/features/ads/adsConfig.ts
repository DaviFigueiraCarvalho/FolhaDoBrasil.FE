// Anúncios: um bloco manual por posição (anúncios automáticos desligados no painel do AdSense).
export const ADS = {
  publisherId: 'ca-pub-4848496352381872',
  // `slot` = data-ad-slot do bloco criado no AdSense. Vazio: em desenvolvimento mostra só o espaço
  // reservado ("Publicidade"); em produção não renderiza nada (sem caixa vazia para o leitor).
  slots: {
    homeMid: { slot: '', minHeight: 120 }, // entre "Últimas notícias" e "Tópicos"
    article: { slot: '', minHeight: 250 }, // depois do texto da notícia aberta
    footer: { slot: '', minHeight: 100 }, // fim da página
  },
  reward: {
    seconds: 5, // duração do anúncio simulado (ver RewardGate)
    unlockHours: 24,
  },
}

export type AdSlotName = keyof typeof ADS.slots
