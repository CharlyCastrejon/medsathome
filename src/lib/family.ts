import { createClient } from "@/lib/supabase/client";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateFamilyCode(): string {
  let code = "MEDS-";
  for (let i = 0; i < 6; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
}

export async function createFamily(name: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No authenticated user" };
  }

  let code = generateFamilyCode();
  let attempts = 0;

  while (attempts < 10) {
    const { data: existing } = await supabase
      .from("families")
      .select("id")
      .eq("code", code)
      .single();

    if (!existing) break;

    code = generateFamilyCode();
    attempts++;
  }

  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({ name, code })
    .select()
    .single();

  if (familyError) {
    return { error: familyError.message };
  }

  const { error: memberError } = await supabase
    .from("user_families")
    .insert({ user_id: user.id, family_id: family.id });

  if (memberError) {
    return { error: memberError.message };
  }

  return { data: family };
}

export async function joinFamily(code: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No authenticated user" };
  }

  const { data: family, error: familyError } = await supabase
    .from("families")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (familyError || !family) {
    return { error: "Invalid family code" };
  }

  const { data: existingMember } = await supabase
    .from("user_families")
    .select("*")
    .eq("user_id", user.id)
    .eq("family_id", family.id)
    .single();

  if (existingMember) {
    return { error: "You already belong to this family" };
  }

  const { error: memberError } = await supabase
    .from("user_families")
    .insert({ user_id: user.id, family_id: family.id });

  if (memberError) {
    return { error: memberError.message };
  }

  return { data: family };
}

export async function updateFamilyName(familyId: string, name: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("families")
    .update({ name })
    .eq("id", familyId);

  if (error) {
    return { error: error.message };
  }

  return { data: { id: familyId, name } };
}

export async function getUserFamily() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No authenticated user" };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("user_families")
    .select("family_id, families(*)")
    .eq("user_id", user.id)
    .single();

  if (membershipError || !membership) {
    return { data: null };
  }

  return { data: membership.families };
}
