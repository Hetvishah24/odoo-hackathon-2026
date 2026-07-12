export interface VehicleDocumentRead {
  id: number;
  vehicle_id: number;
  doc_type: string;
  file_url: string;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleDocumentCreate {
  vehicle_id: number;
  doc_type: string;
  file_url: string;
  expiry_date?: string | null;
}
