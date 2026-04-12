export type EventUiProfile = 'sport' | 'community_event';

export interface EventCategory {
  id: number;
  name: string;
  slug: string;
  ui_profile: EventUiProfile;
  sort_order: number;
}

export interface Match {
  id: number;
  opponent: string;
  date: string;
  time: string;
  location: string;
  team?: string | null; // nur bei ui_profile sport sinnvoll
  deleted_at?: string | null;
  match_date?: string | null;
  kickoff_at?: string | null;
  /** gesetzt nach Migration; fehlend wird wie Sport behandelt */
  event_category_id?: number;
  /** Supabase-Embed: Tabellenname event_categories */
  event_categories?: EventCategory | null;
}

export interface Slot {
  id: number;
  match_id: number;
  category: string;
  time: string;
  user_name: string | null;
  user_contact: string | null;
  cancellation_requested: boolean;
  helper_id?: string | null;
  duration_minutes?: number | null;
}

export interface SlotPublic {
  id: number;
  match_id: number;
  category: string;
  time: string;
  user_name: string | null;
  cancellation_requested: boolean;
  helper_id?: string | null;
  duration_minutes?: number | null;
}

export interface RpcSlotResult {
  success: boolean;
  slot_id: number;
}

export interface ServiceType {
  id: number;
  name: string;
  default_count: number;
}

export interface ServiceTypeMember {
  id: number;
  service_type_id: number;
  name: string;
  order?: number | null;
}

export interface LeaderboardRow {
  helper_id: string;
  total_minutes: number;
  total_points: number;
  total_slots: number;
  last_match_date: string | null;
}