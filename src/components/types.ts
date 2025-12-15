export interface PhotoData {
  user_id: number;
  fn: string;
  pid: number;
  points: number;
  data_time: string;
}

export interface ApiResponse {
  code: number;
  message: string;
  all: number;
  all_post: number;
  data: PhotoData[];
}

export interface GridCell {
  row: number;
  col: number;
  width: number;
  height: number;
}