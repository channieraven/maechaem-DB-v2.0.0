// Auto-generated types for the Maechaem DB v2 Supabase schema.
// Re-generate with: npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts

export type PlantCategory = 'forest' | 'rubber' | 'bamboo' | 'fruit' | 'banana';
export type TreeStatus = 'alive' | 'dead' | 'missing';
export type UserRole = 'pending' | 'staff' | 'researcher' | 'executive' | 'external' | 'admin';
export type ImageType = 'plan_pre_1' | 'plan_pre_2' | 'plan_post_1' | 'gallery';
export type GalleryCategory = 'tree' | 'soil' | 'atmosphere' | 'other';

// ── Row types ────────────────────────────────────────────────────────────────

export interface Plot {
  id: string;
  plot_code: string;          // 'P01', 'P12', …
  name_short: string;         // generated from plot_code: 'P1', 'P12', …
  owner_name: string;
  group_number: number;
  area_sq_m: number | null;
  tambon: string | null;
  elevation_m: number | null;
  boundary_geojson: string | null;
  note: string | null;
  created_at: string;
}

export interface Species {
  id: string;
  species_code: string;       // 'A01', 'B12', …
  species_group: 'A' | 'B';
  group_label: string;        // 'ไม้ป่า' | 'ไม้ผล'
  plant_category: PlantCategory;
  name_th: string;
  name_en: string | null;
  name_sci: string | null;
  hex_color: string;          // 6-char hex, e.g. '2d5a27'
  created_at: string;
}

export interface Profile {
  id: string;                 // matches auth.users(id)
  email: string;
  fullname: string;
  position: string | null;
  organization: string | null;
  role: UserRole;
  approved: boolean;
  created_at: string;
}

export interface Tree {
  id: string;
  tree_code: string;          // e.g. 'P1A0101'
  plot_id: string;
  species_id: string;
  tree_number: number;
  tag_label: string | null;
  row_main: string | null;
  row_sub: string | null;
  utm_x: number | null;
  utm_y: number | null;
  geom: string | null;        // WKB hex from PostGIS
  grid_spacing: number | null;
  note: string | null;
  created_at: string;
}

export interface GrowthLog {
  id: string;
  tree_id: string;
  survey_date: string;        // ISO date 'YYYY-MM-DD'
  recorder_id: string | null;
  height_m: number | null;
  status: TreeStatus | null;
  flowering: boolean | null;
  note: string | null;
  synced_from: string | null; // 'offline_<id>' when synced from queue
  created_at: string;
}

export interface GrowthDbh {
  id: string;
  growth_log_id: string;
  dbh_cm: number;
}

export interface GrowthBamboo {
  id: string;
  growth_log_id: string;
  culm_count: number | null;
  dbh_1_cm: number | null;
  dbh_2_cm: number | null;
  dbh_3_cm: number | null;
}

export interface GrowthBanana {
  id: string;
  growth_log_id: string;
  total_plants: number | null;
  plants_1yr: number | null;
  yield_bunches: number | null;
  yield_hands: number | null;
  price_per_hand: number | null;
}

export interface PlotImage {
  id: string;
  plot_id: string;
  image_type: ImageType;
  gallery_category: GalleryCategory | null;
  legacy_url: string | null;    // Cloudinary (migration fallback)
  storage_path: string | null;  // Supabase Storage
  description: string | null;
  uploaded_by: string | null;
  upload_date: string | null;
  created_at: string;
}

export interface PlotSpacing {
  id: string;
  plot_id: string;
  avg_spacing: number | null;
  min_spacing: number | null;
  max_spacing: number | null;
  tree_count: number | null;
  note: string | null;
  measured_date: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  growth_log_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ── Composite / joined types ──────────────────────────────────────────────────

export interface TreeWithDetails extends Tree {
  plot: Pick<Plot, 'id' | 'plot_code' | 'name_short' | 'owner_name'>;
  species: Pick<Species, 'species_code' | 'name_th' | 'name_sci' | 'plant_category' | 'hex_color'>;
}

export interface GrowthLogWithDetails extends GrowthLog {
  tree: TreeWithDetails;
  recorder: Pick<Profile, 'fullname'> | null;
  growth_dbh?: GrowthDbh | null;
  growth_bamboo?: GrowthBamboo | null;
  growth_banana?: GrowthBanana | null;
}

// ── Supabase Database envelope (for createClient<Database>) ──────────────────

export type Database = {
  public: {
    Tables: {
      plots: { Row: Plot; Insert: Omit<Plot, 'id' | 'created_at'>; Update: Partial<Plot> };
      species: { Row: Species; Insert: Omit<Species, 'id' | 'created_at'>; Update: Partial<Species> };
      profiles: { Row: Profile; Insert: Omit<Profile, 'id' | 'created_at'>; Update: Partial<Profile> };
      trees: { Row: Tree; Insert: Omit<Tree, 'id' | 'created_at'>; Update: Partial<Tree> };
      growth_logs: { Row: GrowthLog; Insert: Omit<GrowthLog, 'id' | 'created_at'>; Update: Partial<GrowthLog> };
      growth_dbh: { Row: GrowthDbh; Insert: Omit<GrowthDbh, 'id'>; Update: Partial<GrowthDbh> };
      growth_bamboo: { Row: GrowthBamboo; Insert: Omit<GrowthBamboo, 'id'>; Update: Partial<GrowthBamboo> };
      growth_banana: { Row: GrowthBanana; Insert: Omit<GrowthBanana, 'id'>; Update: Partial<GrowthBanana> };
      plot_images: { Row: PlotImage; Insert: Omit<PlotImage, 'id' | 'created_at'>; Update: Partial<PlotImage> };
      plot_spacing: { Row: PlotSpacing; Insert: Omit<PlotSpacing, 'id' | 'created_at'>; Update: Partial<PlotSpacing> };
      comments: { Row: Comment; Insert: Omit<Comment, 'id' | 'created_at'>; Update: Partial<Comment> };
      notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'created_at'>; Update: Partial<Notification> };
    };
    Views: Record<string, never>;
    Functions: {
      get_trees_with_latlng: {
        Args: { p_plot_id: string };
        Returns: (Tree & { lat: number; lng: number })[];
      };
      get_plot_summaries: {
        Args: Record<never, never>;
        Returns: (Plot & { tree_count: number; alive_count: number; latest_survey_date: string | null })[];
      };
    };
    Enums: {
      plant_category: PlantCategory;
      tree_status: TreeStatus;
      user_role: UserRole;
      image_type: ImageType;
      gallery_category: GalleryCategory;
    };
  };
};
