import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";

export async function createProfile(
  userId: string,
  firstName: string,
  lastName: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function getUserProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No authenticated user" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function updateProfile(
  firstName: string,
  lastName: string
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No authenticated user" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ first_name: firstName, last_name: lastName })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { data: { id: user.id, first_name: firstName, last_name: lastName } };
}
