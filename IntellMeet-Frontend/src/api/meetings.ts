import { apiRequest } from './client'
import type { BackendMeeting } from '../types'

type MeetingListResponse = { success: true; data: BackendMeeting[] }
type MeetingResponse = { success: true; data: BackendMeeting }

export async function listMeetings() {
  const response = await apiRequest<MeetingListResponse>('/meetings')
  return response.data
}

export async function createMeeting(input: {
  title: string
  description?: string
  scheduledAt?: string | null
}) {
  const response = await apiRequest<MeetingResponse>('/meetings', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return response.data
}
