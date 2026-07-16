"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UsersService, User } from "@/services/users.service";
import { mutate } from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const editUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.string().min(1, "Role is required."),
  isActive: z.boolean(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User | null;
}

export function EditUserModal({ isOpen, setIsOpen, user }: EditUserModalProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      role: "" as unknown as string,
      isActive: undefined as unknown as boolean,
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user, isOpen, form]);

  const handleEditSubmit = async (data: EditUserFormValues) => {
    if (!user) return;
    setIsActionLoading(true);
    try {
      await UsersService.updateUser(user.id, {
        name: data.name,
        role: data.role,
        isActive: data.isActive,
      });
      mutate("/users");
      setIsOpen(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error(err);
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-5 border-b border-border/50">
          <DialogTitle className="text-xl font-bold">Edit Operator</DialogTitle>
          <DialogDescription className="mt-1 text-sm">
            Update details for {user?.name}.
          </DialogDescription>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEditSubmit)} className="px-6 py-5 space-y-4 bg-card">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl bg-secondary/30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email Address
              </label>
              <Input type="email" disabled value={user?.email || ""} className="rounded-xl bg-secondary/30 opacity-70" />
              <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl bg-secondary/30">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="OPERATOR">Operator</SelectItem>
                        <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(val === "true")} 
                      value={field.value === undefined ? "" : field.value ? "true" : "false"}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl bg-secondary/30">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isActionLoading} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                {isActionLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
