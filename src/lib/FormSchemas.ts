import { Audience_type, User_type } from "@prisma/client";
import { z } from "zod";

export const FormSchema = z.object({
  email: z.string().describe("Email").email({ message: "Invalid Email" }),
  password: z.string().describe("Password").min(1, "Password is required"),
});

export const SignUpFormSchema = z
  .object({
    email: z.string().describe("Email").email({ message: "Invalid Email" }),
    password: z
      .string()
      .describe("Password")
      .min(6, "Password must be minimum 6 characters"),
    confirmPassword: z
      .string()
      .describe("Confirm Password")
      .min(6, "Password must be minimum 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const OnboardingFormSchema = z.object({
  fullname: z
    .string()
    .describe("Full Name")
    .min(2, "Name should be atleast 2 character long."),
  about: z
    .string()
    .describe("About")
    .min(20, "Tell us something about yourself in atleast 20 characters."),
  tagline: z.string().describe("Tagline"),
  profile_picture: z.string().url().describe("Profile Picture"),
  banner: z.string().url().describe("Profile Banner"),
  phone_no: z
    .string()
    .min(10, "Number Should have exact 10 digits.")
    .max(10, "Number Should have exact 10 digits."),
  interests: z.array(z.string()).optional(),
  audience_type: z.nativeEnum(Audience_type),
  account_type: z.nativeEnum(User_type),
});

export const StoryFormSchema = z.object({
  title: z
    .string()
    .min(10, "Title should be Atleast 10 character long for better Visibility"),
  pictures: z.string().url().describe("Pictures Related to Story"),
  caption: z
    .string()
    .min(
      10,
      "Caption should be Atleast 10 character long for better Visibility"
    ),
  category: z.array(z.string()),
  body: z.string(),
  description: z
    .string()
    .min(100, "The Story Should be atleast 100 characters long."),
});

export const ArtFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title should be Atleast 5 character long for better Visibility"),
  pictures: z.array(z.string().url().describe("Pictures Related to Story")),
  caption: z
    .string()
    .min(
      10,
      "Caption should be Atleast 10 character long for better Visibility"
    ),
  category: z.array(z.string()),
});

export const CommentForm = z.object({
  body: z.string(),
});
