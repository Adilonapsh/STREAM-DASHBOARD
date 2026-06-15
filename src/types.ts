/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BgmVideo {
  id: string;
  title: string;
}

export interface SyncPayload {
  idx?: number;
  isPlaying?: boolean;
  videos?: BgmVideo[];
  action?: string;
  sender?: string;
  currentTime?: number;
  duration?: number;
  seekTo?: number;
}

export interface Activity {
  type: number;
  url?: string;
  details?: string;
  assets?: {
    large_image?: string;
    [key: string]: any;
  };
}

export interface LanyardResponse {
  success: boolean;
  data?: {
    activities: Activity[];
  };
}
