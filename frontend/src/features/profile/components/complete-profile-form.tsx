"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/auth-context";
import { profileApi } from "@/features/profile/api";

const profileSchema = z.object({
  contact_number: z.string().min(1, "Contact number is required"),
  region: z.string().optional(),
  license_number: z.string().optional(),
  license_category: z.string().optional(),
  license_expiry_date: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function CompleteProfileForm() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const isDriver = user?.role?.name === "driver";

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      contact_number: "",
      region: "",
      license_number: "",
      license_category: "",
      license_expiry_date: "",
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    if (isDriver) {
      let missing = false;
      if (!values.license_number) {
        form.setError("license_number", { message: "License number is required" });
        missing = true;
      }
      if (!values.license_category) {
        form.setError("license_category", { message: "License category is required" });
        missing = true;
      }
      if (!values.license_expiry_date) {
        form.setError("license_expiry_date", { message: "Expiry date is required" });
        missing = true;
      }
      if (missing) return;
    }

    try {
      await profileApi.completeMyProfile({
        contact_number: values.contact_number,
        region: values.region || undefined,
        ...(isDriver
          ? {
              license_number: values.license_number,
              license_category: values.license_category,
              license_expiry_date: values.license_expiry_date,
            }
          : {}),
      });
      await refreshUser();
      toast.success("Profile completed.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Complete your profile</CardTitle>
        <CardDescription>
          {isDriver
            ? "A few more details are needed before you can start dispatching."
            : "Just a couple of details before you get started."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="contact_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Mumbai" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isDriver && (
              <>
                <FormField
                  control={form.control}
                  name="license_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="license_category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License category</FormLabel>
                        <FormControl>
                          <Input placeholder="LMV" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="license_expiry_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
              Finish setup
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
