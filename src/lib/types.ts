export type FamilyMember = {
  id: string;
  household_id: string;
  type: "adult" | "child";
  linked_user_id: string | null;
  name: string;
  birth_date: string | null;
  interests: string[] | null;
  clothing_size: string | null;
  shoe_size: string | null;
  gift_ideas: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
