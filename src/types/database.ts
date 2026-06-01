export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface UserFamily {
  user_id: string;
  family_id: string;
  created_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  family_id: string;
  name: string;
  laboratory: string | null;
  administration_route: string | null;
  quantity: string | null;
  expiration_date: string;
  recommendations: string | null;
  created_at: string;
}

export type CreateMedication = Omit<Medication, "id" | "user_id" | "created_at">;
export type UpdateMedication = Partial<CreateMedication>;
