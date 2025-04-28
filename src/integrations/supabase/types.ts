export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academiccalendar: {
        Row: {
          description: string | null
          end_date: string | null
          event_id: number
          start_date: string | null
          title: string | null
        }
        Insert: {
          description?: string | null
          end_date?: string | null
          event_id?: never
          start_date?: string | null
          title?: string | null
        }
        Update: {
          description?: string | null
          end_date?: string | null
          event_id?: never
          start_date?: string | null
          title?: string | null
        }
        Relationships: []
      }
      assignments: {
        Row: {
          assignment_id: number
          course_id: number | null
          created_at: string | null
          created_by: number | null
          description: string | null
          due_date: string | null
          title: string
        }
        Insert: {
          assignment_id?: number
          course_id?: number | null
          created_at?: string | null
          created_by?: number | null
          description?: string | null
          due_date?: string | null
          title: string
        }
        Update: {
          assignment_id?: number
          course_id?: number | null
          created_at?: string | null
          created_by?: number | null
          description?: string | null
          due_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["faculty_id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_id: number
          course_id: number | null
          date: string | null
          status: string | null
          student_id: number | null
        }
        Insert: {
          attendance_id?: never
          course_id?: number | null
          date?: string | null
          status?: string | null
          student_id?: number | null
        }
        Update: {
          attendance_id?: never
          course_id?: number | null
          date?: string | null
          status?: string | null
          student_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      courses: {
        Row: {
          course_id: number
          course_name: string | null
          faculty_id: number | null
          is_lab: number | null
          section_id: number | null
          semester: number | null
        }
        Insert: {
          course_id?: never
          course_name?: string | null
          faculty_id?: number | null
          is_lab?: number | null
          section_id?: number | null
          semester?: number | null
        }
        Update: {
          course_id?: never
          course_name?: string | null
          faculty_id?: number | null
          is_lab?: number | null
          section_id?: number | null
          semester?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["faculty_id"]
          },
          {
            foreignKeyName: "courses_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["section_id"]
          },
        ]
      }
      faculty: {
        Row: {
          department: string | null
          designation: string | null
          faculty_id: number
          name: string | null
          user_id: number | null
        }
        Insert: {
          department?: string | null
          designation?: string | null
          faculty_id?: never
          name?: string | null
          user_id?: number | null
        }
        Update: {
          department?: string | null
          designation?: string | null
          faculty_id?: never
          name?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      fee: {
        Row: {
          fee_id: number
          paid_amount: number | null
          payment_date: string | null
          semester: number | null
          student_id: number | null
          total_amount: number | null
        }
        Insert: {
          fee_id?: never
          paid_amount?: number | null
          payment_date?: string | null
          semester?: number | null
          student_id?: number | null
          total_amount?: number | null
        }
        Update: {
          fee_id?: never
          paid_amount?: number | null
          payment_date?: string | null
          semester?: number | null
          student_id?: number | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      leaveapplications: {
        Row: {
          from_date: string | null
          leave_id: number
          proof_url: string | null
          reason: string | null
          reviewed_by: number | null
          status: string | null
          student_id: number | null
          to_date: string | null
        }
        Insert: {
          from_date?: string | null
          leave_id?: never
          proof_url?: string | null
          reason?: string | null
          reviewed_by?: number | null
          status?: string | null
          student_id?: number | null
          to_date?: string | null
        }
        Update: {
          from_date?: string | null
          leave_id?: never
          proof_url?: string | null
          reason?: string | null
          reviewed_by?: number | null
          status?: string | null
          student_id?: number | null
          to_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaveapplications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["faculty_id"]
          },
          {
            foreignKeyName: "leaveapplications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      marks: {
        Row: {
          cgpa: number | null
          course_id: number | null
          internal1: number | null
          internal2: number | null
          internal3: number | null
          marks_id: number
          semester_marks: number | null
          student_id: number | null
        }
        Insert: {
          cgpa?: number | null
          course_id?: number | null
          internal1?: number | null
          internal2?: number | null
          internal3?: number | null
          marks_id?: never
          semester_marks?: number | null
          student_id?: number | null
        }
        Update: {
          cgpa?: number | null
          course_id?: number | null
          internal1?: number | null
          internal2?: number | null
          internal3?: number | null
          marks_id?: never
          semester_marks?: number | null
          student_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      sections: {
        Row: {
          name: string | null
          section_id: number
        }
        Insert: {
          name?: string | null
          section_id?: never
        }
        Update: {
          name?: string | null
          section_id?: never
        }
        Relationships: []
      }
      students: {
        Row: {
          current_semester: number | null
          name: string | null
          section_id: number | null
          student_id: number
          user_id: number | null
          year_of_admission: number | null
        }
        Insert: {
          current_semester?: number | null
          name?: string | null
          section_id?: number | null
          student_id?: never
          user_id?: number | null
          year_of_admission?: number | null
        }
        Update: {
          current_semester?: number | null
          name?: string | null
          section_id?: number | null
          student_id?: never
          user_id?: number | null
          year_of_admission?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "students_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["section_id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      timetable: {
        Row: {
          course_id: number | null
          day_of_week: string | null
          period: number | null
          section_id: number | null
          time_slot: string | null
          timetable_id: number
        }
        Insert: {
          course_id?: number | null
          day_of_week?: string | null
          period?: number | null
          section_id?: number | null
          time_slot?: string | null
          timetable_id?: never
        }
        Update: {
          course_id?: number | null
          day_of_week?: string | null
          period?: number | null
          section_id?: number | null
          time_slot?: string | null
          timetable_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "timetable_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "timetable_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["section_id"]
          },
        ]
      }
      users: {
        Row: {
          email: string
          password_hash: string
          role: string
          user_id: number
        }
        Insert: {
          email: string
          password_hash: string
          role: string
          user_id?: never
        }
        Update: {
          email?: string
          password_hash?: string
          role?: string
          user_id?: never
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
