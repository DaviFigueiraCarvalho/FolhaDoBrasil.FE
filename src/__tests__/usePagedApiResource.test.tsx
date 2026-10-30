import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { usePagedApiResource } from '../hooks/usePagedApiResource'
import { apiRequest } from '../api/httpClient'

jest.mock('../api/httpClient', () => ({ apiRequest: jest.fn() }))

function Probe() {
  const { data, isLoading } = usePagedApiResource<number>('/api/v2/news', 2)
  return <Text>{isLoading ? 'loading' : `items:${(data ?? []).join(',')}`}</Text>
}

describe('usePagedApiResource', () => {
  it('pede página a página até a primeira incompleta e acumula os itens', async () => {
    const request = apiRequest as jest.Mock
    request.mockImplementation((path: string) => Promise.resolve(path.includes('page=1') ? [1, 2] : path.includes('page=2') ? [3, 4] : [5]))
    await render(<Probe />)
    expect(await screen.findByText('items:1,2,3,4,5')).toBeTruthy()
    expect(request.mock.calls.map(([path]) => path)).toEqual([
      '/api/v2/news?page=1&pageSize=2',
      '/api/v2/news?page=2&pageSize=2',
      '/api/v2/news?page=3&pageSize=2',
    ])
  })
})
