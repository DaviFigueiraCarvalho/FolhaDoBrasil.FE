import { render, screen } from '@testing-library/react-native'
import AsyncState from '../components/AsyncState'
import { Text } from 'react-native'

describe('AsyncState', () => {
  it('mostra loading quando isLoading', async () => {
    await render(<AsyncState isLoading loadingLabel="Buscando...">
      <Text>conteúdo</Text>
    </AsyncState>)
    expect(screen.getByText('Buscando...')).toBeTruthy()
    expect(screen.queryByText('conteúdo')).toBeNull()
  })

  it('mostra erro genérico com botão de retry quando isError e status != 403', async () => {
    const onRetry = jest.fn()
    await render(
      <AsyncState isError error={{ detail: 'Falha ao carregar' }} onRetry={onRetry}>
        <Text>conteúdo</Text>
      </AsyncState>
    )
    expect(screen.getByText('Não foi possível carregar')).toBeTruthy()
    expect(screen.getByText('Falha ao carregar')).toBeTruthy()
    expect(screen.getByText('Tentar novamente')).toBeTruthy()
  })

  it('mostra "Acesso negado" sem retry quando status é 403', async () => {
    await render(
      <AsyncState isError error={{ status: 403, detail: 'Sem permissão' }} onRetry={jest.fn()}>
        <Text>conteúdo</Text>
      </AsyncState>
    )
    expect(screen.getByText('Acesso negado')).toBeTruthy()
    expect(screen.queryByText('Tentar novamente')).toBeNull()
  })

  it('mostra empty state quando isEmpty', async () => {
    await render(
      <AsyncState isEmpty emptyTitle="Nada por aqui" emptyDescription="Volte mais tarde">
        <Text>conteúdo</Text>
      </AsyncState>
    )
    expect(screen.getByText('Nada por aqui')).toBeTruthy()
    expect(screen.getByText('Volte mais tarde')).toBeTruthy()
  })

  it('renderiza os children quando não está loading/error/empty', async () => {
    await render(
      <AsyncState>
        <Text>conteúdo</Text>
      </AsyncState>
    )
    expect(screen.getByText('conteúdo')).toBeTruthy()
  })
})
