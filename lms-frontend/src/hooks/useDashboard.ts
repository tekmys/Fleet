import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import type { AdminStats, LecturerStats, StudentStats } from '../services/dashboard.service'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats', 'general'],
    queryFn: () => dashboardService.getStats().then(r => r.data.data),
    staleTime: 60_000, // 1 min — dashboard data doesn't need to be live
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats', 'admin'],
    queryFn: () => dashboardService.getStats().then(r => r.data.data as AdminStats),
    staleTime: 60_000,
  })
}

export function useLecturerStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats', 'lecturer'],
    queryFn: () => dashboardService.getStats().then(r => r.data.data as LecturerStats),
    staleTime: 60_000,
  })
}

export function useStudentStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats', 'student'],
    queryFn: () => dashboardService.getStats().then(r => r.data.data as StudentStats),
    staleTime: 60_000,
  })
}

