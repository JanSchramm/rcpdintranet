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
          created_at: string;
        };
        Insert: {
          id: string;
          firstname?: string;
          lastname?: string;
          badgenumber?: string | null;
          rank?: string;
          division?: string[];
          role?: 'officer' | 'admin' | 'supervisor';
          created_at?: string;
        };
        Update: {
          id?: string;
          firstname?: string;
          lastname?: string;
          badgenumber?: string | null;
          rank?: string;
          division?: string[];
          role?: 'officer' | 'admin' | 'supervisor';
          created_at?: string;
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
        };
        Insert: {
          id?: string;
          created_at?: string;
          sender_id: string;
          receiver_id: string;
          subject: string;
          body: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          sender_id?: string;
          receiver_id?: string;
          subject?: string;
          body?: string;
        };
      };
      personnel_files: {
        Row: {
          id: string;
          created_at: string;
          created_by: string;
          officer_id: string;
          notes: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          created_by?: string;
          officer_id: string;
          notes: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          created_by?: string;
          officer_id?: string;
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
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          date: string;
          event_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          event_type?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Officer = Database['public']['Tables']['user']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type PersonnelFile = Database['public']['Tables']['personnel_files']['Row'];
export type RosterEvent = Database['public']['Tables']['events']['Row'];
