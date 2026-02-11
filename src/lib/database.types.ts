export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      org_settings: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_logo_url: string | null
          canvas_size: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_logo_url?: string | null
          canvas_size?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          company_logo_url?: string | null
          canvas_size?: string
          created_at?: string
          updated_at?: string
        }
      }
      org_levels: {
        Row: {
          id: string
          user_id: string
          level_name: string
          level_order: number
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          level_name: string
          level_order: number
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          level_name?: string
          level_order?: number
          color?: string
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string
          employee_name: string
          position: string
          level_id: string
          manager_id: string | null
          picture_url: string | null
          email: string | null
          department: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          employee_name: string
          position: string
          level_id: string
          manager_id?: string | null
          picture_url?: string | null
          email?: string | null
          department?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          employee_name?: string
          position?: string
          level_id?: string
          manager_id?: string | null
          picture_url?: string | null
          email?: string | null
          department?: string | null
          created_at?: string
        }
      }
    }
  }
}
