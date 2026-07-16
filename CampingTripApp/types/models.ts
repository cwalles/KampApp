// Types mirror schema/001_initial_schema.sql

export type GearCategory =
  | 'Shelter'
  | 'Kitchen'
  | 'Braai/Potjie'
  | 'Kids'
  | 'Bedding'
  | 'Tools'
  | 'Consumables';

export type ChecklistState = 'not_packed' | 'packed' | 'at_camp' | 'packed_home';

export interface Family {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string | null;
  start_date: string;
  end_date: string;
  organiser_family_id: string;
  kids_weighting: number;
  invite_code: string;
  status: 'active' | 'settled' | 'archived';
  created_at: string;
}

export interface GearItem {
  id: string;
  family_id: string;
  name: string;
  category: GearCategory;
  qty_owned: number;
  storage_location: string | null;
  photo_url: string | null;
  is_consumable: boolean;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  trip_id: string;
  gear_item_id: string | null;
  family_id: string | null;
  name: string;
  category: GearCategory;
  is_communal: boolean;
  owner_family_id: string | null;
  is_consumable: boolean;
  state: ChecklistState;
  created_at: string;
}
