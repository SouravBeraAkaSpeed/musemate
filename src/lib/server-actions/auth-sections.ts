"use server";

import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { cookies } from "next/headers";
import { FormSchema } from "@/lib/FormSchemas";

export async function actionLoginUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
  cookies().getAll();
  
  const supabase = createRouteHandlerClient({ cookies });
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  const error = response.error
  if (error) {
    return {
      error: {
        message: error.message,
      },
    };
  } else {
    return {
      success: true,
    };
  }
}

export async function actionSignUpUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
  cookies().getAll();
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("users").select("*").eq("email", email);

  if (data?.length) return { error: { message: "User already exists", data } };
  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback`,
    },
  });
  return response;
}

export async function actionSignOut() {
  cookies().getAll();
  const supabase = createRouteHandlerClient({ cookies });
  const { error } = await supabase.auth.signOut();
  if (error) {
    return error;
  } else {
    return null;
  }
}
