import { useMutation, useQueryClient } from '@tanstack/react-query'
import { callEdgeFunction } from '@/lib/edge'
import type { PulseResponse } from './api'

export function useSubmitPulse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { score: number; note?: string }) =>
      callEdgeFunction<{ score: number; note?: string }, PulseResponse>('submit-pulse', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pulse'] }),
  })
}
