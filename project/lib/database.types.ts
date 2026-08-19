export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  public: {
    Tables: {
      user: {
        Row: {
          id: string;
          firstname: string;
          lastname: string;
          badgenumber: string | null;
          rank: string;
          division: string[];
          role: 'officer' | 'admin' | 'supervisor';
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          discipline_points: number;
          rank_id: string | null;
        };
        Insert: {
          id: string;
          firstname?: string;
          lastname?: string;
          badgenumber?: string | null;
          rank?: string;
          division?: string[];
          role?: 'officer' | 'admin' | 'supervisor';
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          discipline_points?: number;
          rank_id?: string | null;
        };
        Update: {
          id?: string;
          firstname?: string;
          lastname?: string;
          badgenumber?: string | null;
          rank?: string;
          division?: string[];
          role?: 'officer' | 'admin' | 'supervisor';
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          discipline_points?: number;
          rank_id?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          created_at: string;
          sender_id: string;
          receiver_id: string;
          subject: string;
          body: string;
          read: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          sender_id: string;
          receiver_id: string;
          subject: string;
          body: string;
          read?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          sender_id?: string;
          receiver_id?: string;
          subject?: string;
          body?: string;
          read?: boolean;
        };
      };
      personnel_files: {
        Row: {
          id: string;
          created_at: string;
          created_by: string;
          officer_id: string;
          title: string;
          notes: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          created_by?: string;
          officer_id: string;
          title?: string;
          notes: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          created_by?: string;
          officer_id?: string;
          title?: string;
          notes?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          date: string;
          event_type: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          date: string;
          event_type?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          event_type?: string;
          created_at?: string;
          created_by?: string | null;
        };
      };
      rank_definitions: {
        Row: {
          id: string;
          title: string;
          order_index: number;
          level: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          order_index?: number;
          level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          order_index?: number;
          level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      divisions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export interface Officer {
  id: string;
  firstname: string;
  lastname: string;
  rank: string;
  badgenumber?: string;
  division?: string[];
  role?: 'officer' | 'admin' | 'supervisor';
  status?: 'pending' | 'approved' | 'rejected';
  discipline_points?: number;
  rank_id?: string | null;
  created_at: string;
}

export type RankDefinition = Database['public']['Tables']['rank_definitions']['Row'];
export type Division = Database['public']['Tables']['divisions']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type PersonnelFile = Database['public']['Tables']['personnel_files']['Row'];
export type RosterEvent = Database['public']['Tables']['events']['Row'];
