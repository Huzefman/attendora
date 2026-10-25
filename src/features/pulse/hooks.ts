import { useQuery } from '@tanstack/react-query'
import { fetchMyPulse, fetchPulseHistory, fetchPulseSummary, currentWeekStart } from './api'

export function useMyPulse(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['pulse', 'mine', employeeId, currentWeekStart()],
    queryFn: () => fetchMyPulse(employeeId!),
    enabled: !!employeeId,
  })
}

export function usePulseHistory(employeeId: string | undefined, weeks = 8) {
  return useQuery({
    queryKey: ['pulse', 'history', employeeId, weeks],
    queryFn: () => fetchPulseHistory(employeeId!, weeks),
    enabled: !!employeeId,
  })
}

export function usePulseSummary(weeks = 8) {
  return useQuery({
    queryKey: ['pulse', 'summary', weeks],
    queryFn: () => fetchPulseSummary(weeks),
  })
}
