// Mock Supabase implementation to avoid dependency issues
export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
  }),
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          password_hash: string
          status: 'active' | 'inactive' | 'blocked'
          balance: number
          level: number
          points: number
          star_points: number
          total_spent: number
          transactions_count: number
          created_at: string
          updated_at: string
          last_active: string
          kyc_status: 'pending' | 'verified' | 'rejected'
          profile_image: string | null
          address: string | null
          date_of_birth: string | null
          metadata: any
        }
        Insert: {
          name: string
          email: string
          phone: string
          password_hash: string
          status?: 'active' | 'inactive' | 'blocked'
          balance?: number
          level?: number
          points?: number
          star_points?: number
          total_spent?: number
          transactions_count?: number
          kyc_status?: 'pending' | 'verified' | 'rejected'
          profile_image?: string | null
          address?: string | null
          date_of_birth?: string | null
          metadata?: any
        }
        Update: {
          name?: string
          email?: string
          phone?: string
          password_hash?: string
          status?: 'active' | 'inactive' | 'blocked'
          balance?: number
          level?: number
          points?: number
          star_points?: number
          total_spent?: number
          transactions_count?: number
          last_active?: string
          kyc_status?: 'pending' | 'verified' | 'rejected'
          profile_image?: string | null
          address?: string | null
          date_of_birth?: string | null
          metadata?: any
        }
      }
      recharge_requests: {
        Row: {
          id: string
          user_id: string
          amount: number
          payment_method: string
          reference_code: string | null
          proof_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          notes: string | null
          admin_notes: string | null
          processed_by: string | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          amount: number
          payment_method: string
          reference_code?: string | null
          proof_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          notes?: string | null
          admin_notes?: string | null
          processed_by?: string | null
          processed_at?: string | null
        }
        Update: {
          amount?: number
          payment_method?: string
          reference_code?: string | null
          proof_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          notes?: string | null
          admin_notes?: string | null
          processed_by?: string | null
          processed_at?: string | null
        }
      }
    }
  }
}

// Services API
export const userService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(id: string, updates: Database['public']['Tables']['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const rechargeService = {
  async getRechargeRequests() {
    const { data, error } = await supabase
      .from('recharge_requests')
      .select(`
        *,
        user:users(name, email, phone)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createRechargeRequest(recharge: Database['public']['Tables']['recharge_requests']['Insert']) {
    const { data, error } = await supabase
      .from('recharge_requests')
      .insert(recharge)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateRechargeRequest(id: string, updates: Database['public']['Tables']['recharge_requests']['Update']) {
    const { data, error } = await supabase
      .from('recharge_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}