import {
  Audience_type,
  Content_Type,
  Interests,
  User_type,
  Visibility_type,
} from "@prisma/client";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      contents: {
        Row: {
          authorId: string;
          body: string | null;
          caption: string | null;
          category: Database["public"]["Enums"]["Interests"][] | null;
          createdAt: string;
          id: string;
          likes: number;
          modifiedAt: string;
          pictures: string[] | null;
          savedBy: number;
          title: string | null;
          total_voters: number;
          type: Database["public"]["Enums"]["Content_Type"];
          visibility_type: Database["public"]["Enums"]["Visibility_type"];
        };
        Insert: {
          authorId: string;
          body?: string | null;
          caption?: string | null;
          category?: Database["public"]["Enums"]["Interests"][] | null;
          createdAt?: string;
          id: string;
          likes?: number;
          modifiedAt?: string;
          pictures?: string[] | null;
          savedBy?: number;
          title?: string | null;
          total_voters?: number;
          type: Database["public"]["Enums"]["Content_Type"];
          visibility_type: Database["public"]["Enums"]["Visibility_type"];
        };
        Update: {
          authorId?: string;
          body?: string | null;
          caption?: string | null;
          category?: Database["public"]["Enums"]["Interests"][] | null;
          createdAt?: string;
          id?: string;
          likes?: number;
          modifiedAt?: string;
          pictures?: string[] | null;
          savedBy?: number;
          title?: string | null;
          total_voters?: number;
          type?: Database["public"]["Enums"]["Content_Type"];
          visibility_type?: Database["public"]["Enums"]["Visibility_type"];
        };
        Relationships: [];
      };
      Poll_options: {
        Row: {
          contentId: string;
          id: string;
          option: string;
          percentage: number;
        };
        Insert: {
          contentId: string;
          id: string;
          option: string;
          percentage?: number;
        };
        Update: {
          contentId?: string;
          id?: string;
          option?: string;
          percentage?: number;
        };
        Relationships: [];
      };
      UserConnection: {
        Row: {
          createdAt: string;
          followerId: string;
          id: string;
          modifiedAt: string;
          userId: string;
        };
        Insert: {
          createdAt?: string;
          followerId: string;
          id: string;
          modifiedAt: string;
          userId: string;
        };
        Update: {
          createdAt?: string;
          followerId?: string;
          id?: string;
          modifiedAt?: string;
          userId?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          about: string | null;
          audience_type: Database["public"]["Enums"]["Audience_type"];
          createdAt: string;
          email: string;
          full_name: string | null;
          id: string;
          Interests: Database["public"]["Enums"]["Interests"][] | null;
          modifiedAt: string;
          onboarded: boolean;
          phone_no: string | null;
          profile_picture: string | null;
          type: Database["public"]["Enums"]["User_type"];
        };
        Insert: {
          about?: string | null;
          audience_type?: Database["public"]["Enums"]["Audience_type"];
          createdAt?: string;
          email: string;
          full_name?: string | null;
          id: string;
          Interests?: Database["public"]["Enums"]["Interests"][] | null;
          modifiedAt?: string;
          onboarded?: boolean;
          phone_no?: string | null;
          profile_picture?: string | null;
          type?: Database["public"]["Enums"]["User_type"];
        };
        Update: {
          about?: string | null;
          audience_type?: Database["public"]["Enums"]["Audience_type"];
          createdAt?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          Interests?: Database["public"]["Enums"]["Interests"][] | null;
          modifiedAt?: string;
          onboarded?: boolean;
          phone_no?: string | null;
          profile_picture?: string | null;
          type?: Database["public"]["Enums"]["User_type"];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      Audience_type: "Artist" | "Audience";
      Content_Type: "STORY" | "ART" | "POLL";
      Interests:
        | "Horror"
        | "Thriller"
        | "Action"
        | "Mystery"
        | "Drama"
        | "ScienceFiction"
        | "Comedy"
        | "Romance";
      User_type: "public" | "private";
      Visibility_type: "Public" | "Private";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type user = {
  about: string | null;
  audience_type: Audience_type;
  email: string;
  tagline: string | null;
  full_name: string | null;
  Interests: Interests[];
  onboarded: boolean;
  phone_no: string | null;
  profile_picture: string | null;
  banner: string | null;
  type: User_type;
  createdAt?: Date;
  modifiedAt?: Date;
};

export type content = {
  authorId: string;
  body: string | null;
  description: string | null;
  caption: string | null;
  category: Interests[];
  createdAt: Date;
  id: string;
  likes: number;
  modifiedAt: Date;
  pictures: string[];
  savedBy: number;
  title: string | null;
  total_voters: number;
  type: Content_Type;
  visibility_type: Visibility_type;
  isTrending: boolean;
  comments: number;
};

export type contentWithUser = content & { author: user };
