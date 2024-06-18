import { db } from "@/lib/db";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const currentProfile = async () => {
  cookies().getAll();
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("user :null");
    return null;
  }

  console.log("emmail:", user.email);

  if (!user.email) return null;

  const profile = await db.public_users.findUnique({
    where: { email: user.email },
  });

  if (!profile) return null;

  return profile;
};
