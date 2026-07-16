"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UsersService } from "@/services/users.service";
import { mutate } from "swr";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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

const addUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.string().min(1, "Role is required."),
  isActive: z.boolean(),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

export function AddUserModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "" as unknown as string,
      isActive: undefined as unknown as boolean,
    },
  });

  const handleAddSubmit = async (data: AddUserFormValues) => {
    setIsActionLoading(true);
    try {
      await UsersService.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        isActive: data.isActive,
      });
      mutate("/users");
      setIsOpen(false);
      form.reset();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error(err);
      alert(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) form.reset({ name: "", email: "", password: "", role: "" as unknown as string, isActive: undefined as unknown as boolean });
    }}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-12 shadow-sm shadow-indigo-200 font-medium shrink-0 transition-all active:scale-95 duration-200">
          <Plus className="mr-2 h-5 w-5" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-indigo-600 px-6 py-5 text-white">
          <DialogTitle className="text-xl font-bold">Add New Operator</DialogTitle>
          <DialogDescription className="text-indigo-100 mt-1 text-sm">
            Fill in the details to create a new operator account.
          </DialogDescription>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddSubmit)} className="px-6 py-5 space-y-4 bg-card">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="rounded-xl bg-secondary/30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" autoComplete="off" className="rounded-xl bg-secondary/30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Min. 6 characters" autoComplete="new-password" className="rounded-xl bg-secondary/30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {isActionLoading ? "Saving..." : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
