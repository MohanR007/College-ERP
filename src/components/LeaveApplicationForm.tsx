
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileUpload } from "./FileUpload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  from_date: z.string(),
  to_date: z.string(),
  proof_url: z.string().optional(),
});

interface LeaveApplicationFormProps {
  onSuccess: () => void;
  initialData?: {
    leave_id: number;
    reason: string;
    from_date: string;
    to_date: string;
    proof_url: string | null;
    status: string;
  };
}

export function LeaveApplicationForm({ onSuccess, initialData }: LeaveApplicationFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      reason: initialData.reason || "",
      from_date: initialData.from_date?.split('T')[0] || "",
      to_date: initialData.to_date?.split('T')[0] || "",
      proof_url: initialData.proof_url || "",
    } : {
      reason: "",
      from_date: "",
      to_date: "",
      proof_url: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data: studentData } = await supabase
        .from('students')
        .select('student_id')
        .eq('user_id', user?.user_id)
        .single();

      if (!studentData) {
        throw new Error('Student not found');
      }

      const leaveData = {
        student_id: studentData.student_id,
        reason: values.reason,
        from_date: values.from_date,
        to_date: values.to_date,
        proof_url: values.proof_url,
        status: 'Pending'
      };

      if (initialData) {
        const { error } = await supabase
          .from('leaveapplications')
          .update(leaveData)
          .eq('leave_id', initialData.leave_id);

        if (error) throw error;
        toast({
          title: "Leave application updated",
          description: "Your leave application has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('leaveapplications')
          .insert([leaveData]);

        if (error) throw error;
        toast({
          title: "Leave application submitted",
          description: "Your leave application has been submitted successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting leave application:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your leave application",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Leave</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter your reason for leave" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="from_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="to_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="proof_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supporting Document</FormLabel>
              <FormControl>
                <FileUpload
                  onUpload={(url) => field.onChange(url)}
                  existingUrl={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {initialData ? "Update Application" : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
}
