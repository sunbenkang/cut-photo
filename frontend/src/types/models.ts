// Auth
export interface UserInfo {
  id: number;
  app_key_prefix: string;
}

export interface LoginResponse {
  session_token: string;
  user: UserInfo;
}

// Upload / Validation
export interface ValidationLayer {
  name: string;
  passed: boolean;
  detail: string;
}

export interface FaceBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UploadResponse {
  upload_id: string;
  status: string;
  valid: boolean;
  layers: ValidationLayer[];
  faces: FaceBox[];
  preview_url: string;
  original_width: number;
  original_height: number;
}

// Movies
export interface MovieResult {
  id: string;
  title_cn: string;
  title_en: string;
  year: number;
  poster_url: string;
  director: string;
}

export interface CharacterInfo {
  actor_name: string;
  character_name: string;
  profile_path: string;
}

export interface MovieDetail {
  id: string;
  title_cn: string;
  title_en: string;
  year: number;
  poster_url: string;
  directors: string[];
  characters: CharacterInfo[];
  overview: string;
  message?: string;
}

// Templates
export interface TemplateInfo {
  id: number;
  name: string;
  description: string;
  prompt_template: string;
  depth_of_field: string | null;
  aspect_ratio: string | null;
  thumbnail_url: string;
  sort_order: number;
}

// Config
export interface AspectRatioOption {
  label: string;
  value: string;
}

export interface DepthOfFieldOption {
  label: string;
  value: string;
  description: string;
}

export interface AppConfig {
  aspect_ratios: AspectRatioOption[];
  depth_of_fields: DepthOfFieldOption[];
}

// Works
export interface WorkItem {
  id: number;
  image_url: string;
  movie_title_cn: string | null;
  movie_title_en: string | null;
  character_name: string | null;
  aspect_ratio: string | null;
  depth_of_field: string | null;
  template_name: string | null;
  file_size: number;
  width: number;
  height: number;
  created_at: string;
}

export interface WorkListResponse {
  works: WorkItem[];
  total: number;
  page: number;
  limit: number;
}
