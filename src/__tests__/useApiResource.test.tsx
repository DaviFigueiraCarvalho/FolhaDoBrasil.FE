import { act, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { useApiResource } from '../hooks/useApiResource'

function Probe({ fetcher, id }: { fetcher: (signal?: AbortSignal) => Promise<string>; id: number }) {
  const { data, error, isLoading, isError } = useApiResource(fetcher, [id])
  return (
    <Text>
      {isLoading ? 'loading' : isError ? `error:${String(error)}` : `data:${data}`}
    </Text>
  )
}

describe('useApiResource', () => {
  it('mostra loading e depois os dados quando o fetcher resolve', async () => {
    const fetcher = jest.fn().mockResolvedValue('ok')
    await render(<Probe fetcher={fetcher} id={1} />)
    expect(await screen.findByText('data:ok')).toBeTruthy()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('mostra erro quando o fetcher rejeita', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('falhou'))
    await render(<Probe fetcher={fetcher} id={1} />)
    expect(await screen.findByText('error:Error: falhou')).toBeTruthy()
  })

  it('refaz a busca quando um item de deps muda', async () => {
    const fetcher = jest.fn().mockResolvedValue('ok')
    const { rerender } = await render(<Probe fetcher={fetcher} id={1} />)
    await screen.findByText('data:ok')

    await act(async () => {
      await rerender(<Probe fetcher={fetcher} id={2} />)
    })

    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
