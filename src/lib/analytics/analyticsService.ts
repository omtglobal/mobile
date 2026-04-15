/**
 * Client-side analytics: batches events, queues offline, flushes to API.
 * Never blocks UI; swallows errors.
 */

import NetInfo from '@react-native-community/netinfo';
import { apiClient } from '~/lib/api/client';
import { mmkv } from '~/lib/utils/storage';
import type { AnalyticsEventType } from '~/types/models';

const STORAGE_KEY = 'analytics_offline_queue';
const BATCH_THRESHOLD = 10;
const FLUSH_INTERVAL_MS = 5000;
const MAX_OFFLINE_QUEUE = 500;

interface QueuedEvent {
  event_type: AnalyticsEventType;
  payload: Record<string, unknown>;
  ts: number;
}

function loadOfflineQueue(): QueuedEvent[] {
  try {
    const raw = mmkv.getString(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOfflineQueue(queue: QueuedEvent[]): void {
  try {
    const trimmed = queue.slice(-MAX_OFFLINE_QUEUE);
    mmkv.set(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

class AnalyticsServiceClass {
  private queue: QueuedEvent[] = [];
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private isProcessing = false;
  private lastFlushMinute = 0;
  private sentThisMinute = 0;

  constructor() {
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        this.flushOfflineQueue();
      }
    });
  }

  track(eventType: AnalyticsEventType, payload: Record<string, unknown> = {}): void {
    const event: QueuedEvent = { event_type: eventType, payload, ts: Date.now() };

    this.queue.push(event);

    if (this.queue.length >= BATCH_THRESHOLD) {
      this.flush();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flush(), FLUSH_INTERVAL_MS);
    }
  }

  private flush(): void {
    if (this.isProcessing || this.queue.length === 0) return;

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const events = [...this.queue];
    this.queue = [];

    this.sendBatch(events).catch(() => {
      // Offline: save to MMKV for later
      const offline = loadOfflineQueue();
      offline.push(...events);
      saveOfflineQueue(offline);
    });
  }

  private async sendBatch(events: QueuedEvent[]): Promise<void> {
    this.isProcessing = true;

    try {
      let i = 0;
      for (; i < events.length; i++) {
        const e = events[i];
        try {
          await apiClient.post('/track', { event_type: e.event_type, payload: e.payload });
        } catch {
          // Network error: save remaining events to offline queue
          const failed = events.slice(i);
          const offline = loadOfflineQueue();
          offline.push(...failed);
          saveOfflineQueue(offline);
          break;
        }
      }
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0 && !this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.flush(), FLUSH_INTERVAL_MS);
      }
    }
  }

  private flushOfflineQueue(): void {
    const offline = loadOfflineQueue();
    if (offline.length === 0) return;

    saveOfflineQueue([]);
    this.queue.unshift(...offline);
    this.flush();
  }

  // Convenience methods
  productViewed(productId: string): void {
    this.track('ProductViewed', { product_id: productId });
  }

  productPhotoViewed(productId: string, photoIndex?: number, mediaId?: string): void {
    this.track('ProductPhotoViewed', {
      product_id: productId,
      ...(photoIndex != null && { photo_index: photoIndex }),
      ...(mediaId && { media_id: mediaId }),
    });
  }

  categoryViewed(categoryId: string): void {
    this.track('CategoryViewed', { category_id: categoryId });
  }

  searchPerformed(query: string, filters?: Record<string, unknown>): void {
    this.track('SearchPerformed', { search_query: query, ...filters });
  }

  addToCartClicked(productId: string, quantity = 1): void {
    this.track('AddToCartClicked', { product_id: productId, quantity });
  }

  checkoutStarted(): void {
    this.track('CheckoutStarted', {});
  }

  paymentClicked(orderId?: string): void {
    this.track('PaymentClicked', orderId ? { order_id: orderId } : {});
  }
}

export const analytics = new AnalyticsServiceClass();
