// Tipos gerados manualmente — rode `npx supabase gen types typescript` para atualizar
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          city: string | null;
          bio: string | null;
          avatar_url: string | null;
          weekly_goal_km: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      routes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          type: 'urbano' | 'trilha' | 'estrada';
          difficulty: 'easy' | 'medium' | 'hard';
          privacy: 'public' | 'private';
          distance_km: number;
          duration_seconds: number;
          elevation_gain: number;
          elevation_loss: number;
          avg_speed: number;
          calories: number;
          cover_image: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['routes']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['routes']['Insert']>;
      };
      route_points: {
        Row: {
          id: number;
          route_id: string;
          lat: number;
          lng: number;
          altitude: number | null;
          speed: number | null;
          accuracy: number | null;
          recorded_at: string;
        };
        Insert: Omit<Database['public']['Tables']['route_points']['Row'], 'id'>;
        Update: never;
      };
    };
  };
}
