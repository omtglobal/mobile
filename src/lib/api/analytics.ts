import { apiClient } from './client';
import type { ApiResponse } from '~/types/api';
import type { AnalyticsEventType } from '~/types/models';

export const analyticsApi = {
  track: (eventType: AnalyticsEventType, payload: Record<string, unknown>) =>
    apiClient
      .post<ApiResponse<unknown>>('/track', { event_type: eventType, payload })
      .then((r) => r.data),
};
