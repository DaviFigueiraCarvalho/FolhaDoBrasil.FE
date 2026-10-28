import { apiErrorFromResponse } from '../api/apiError'

// Regressão: uma resposta não-JSON com um corpo grande/HTML (ex.: a página de fallback do dev
// server quando a API não está configurada) não pode virar `detail` inteiro na tela — isso já
// produziu um card de erro de ~26.000px de altura, empurrando qualquer conteúdo abaixo (inclusive
// botões) para muito além da área visível, dando a impressão de que "o botão não funciona".
describe('apiErrorFromResponse', () => {
  it('usa detail de um ProblemDetails JSON normalmente', () => {
    const error = apiErrorFromResponse(400, { detail: 'Nome de usuário já existe.' })
    expect(error.detail).toBe('Nome de usuário já existe.')
  })

  it('usa uma string curta e sem marcação como detail', () => {
    const error = apiErrorFromResponse(500, 'Internal Server Error')
    expect(error.detail).toBe('Internal Server Error')
  })

  it('NUNCA usa um corpo HTML como detail, mesmo que curto', () => {
    const error = apiErrorFromResponse(404, '<!DOCTYPE html><html><body>Not Found</body></html>')
    expect(error.detail).not.toContain('<html>')
    expect(error.detail).toBe('Não encontramos o que você procurava.')
  })

  it('NUNCA usa um corpo de texto muito longo como detail (cai para a mensagem segura do status)', () => {
    const hugeBody = 'x'.repeat(5000)
    const error = apiErrorFromResponse(500, hugeBody)
    expect(error.detail?.length).toBeLessThan(200)
    expect(error.detail).not.toBe(hugeBody)
  })

  it('cai para a mensagem segura do status quando o corpo é vazio/nulo', () => {
    const error = apiErrorFromResponse(403, null)
    expect(error.detail).toBe('Você não tem permissão para executar esta ação.')
  })
})
