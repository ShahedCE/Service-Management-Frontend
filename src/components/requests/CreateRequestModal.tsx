"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { RequestsService } from "@/services/requests.service";
import { mutate } from "swr";
import { useModalStore } from "@/store/modal.store";

const requestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title is too long."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000, "Description is too long."),
  priority: z.string().min(1, "Priority is required."),
});

type RequestFormValues = z.infer<typeof requestSchema>;

export function CreateRequestModal() {
  const { isCreateModalOpen, setCreateModalOpen } = useModalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "LOW",
    },
  });

  const onSubmit = async (data: RequestFormValues) => {
    setIsSubmitting(true);
    try {
      await RequestsService.createRequest(data);
      // Revalidate the SWR queries
      mutate("/requests");
      mutate("/requests/stats");

      setCreateModalOpen(false);
      form.reset();
    } catch (err) {
      console.error("Failed to create request", err);
      alert("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setCreateModalOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-12 shadow-sm shadow-indigo-200 hover:shadow-indigo-300 font-medium shrink-0 transition-all hover:scale-105 active:scale-95 duration-200"
      >
        <Plus className="mr-2 h-5 w-5" />
        Create Request
      </Button>

      <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-6 text-white">
          <DialogTitle className="text-xl font-bold tracking-tight">Create New Request</DialogTitle>
          <DialogDescription className="text-indigo-100 mt-1.5 text-xs leading-relaxed">
            Provide detailed information about the service required. A clear description helps supervisors process it faster.
          </DialogDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-5 bg-card">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">Request Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Server Maintenance Required"
                      className="h-11 rounded-xl bg-secondary/30 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 border-border/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue, required resources, and impact..."
                      className="min-h-[100px] rounded-xl bg-secondary/30 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 border-border/50 resize-none transition-all duration-200 focus:bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">Priority Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl bg-secondary/30 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 border-border/50">
                        <SelectValue placeholder="Select a priority level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/50 shadow-xl">
                      <SelectItem value="LOW">Low - Routine</SelectItem>
                      <SelectItem value="MEDIUM">Medium - Important</SelectItem>
                      <SelectItem value="HIGH">High - Urgent</SelectItem>
                      <SelectItem value="CRITICAL">Critical - Immediate Action</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl font-medium hover:bg-secondary transition-all hover:scale-105 active:scale-95 duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 shadow-md shadow-indigo-200 hover:shadow-lg transition-all hover:scale-105 active:scale-95 duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  </>
  );
}
