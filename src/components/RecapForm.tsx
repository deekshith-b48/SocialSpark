'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { runGenerateEventRecapPost } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { GeneratedContent } from './PostPreviews';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  eventDescription: z.string().min(20, 'Description must be at least 20 characters.'),
});

type RecapFormValues = z.infer<typeof formSchema>;

interface RecapFormProps {
  setIsLoading: (isLoading: boolean) => void;
  setGeneratedContent: (content: GeneratedContent) => void;
}

export function RecapForm({ setIsLoading, setGeneratedContent }: RecapFormProps) {
  const { toast } = useToast();
  const form = useForm<RecapFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventDescription: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: RecapFormValues) {
    setIsLoading(true);
    setGeneratedContent(null);
    const result = await runGenerateEventRecapPost(values);
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Recap',
        description: result.error,
      });
    } else {
      setGeneratedContent(result.data || null);
      toast({
        title: 'Recap Generated!',
        description: 'Your event recap post is ready.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h3 className="text-xl font-headline font-semibold">Post-Event Recap</h3>
        <FormField
          control={form.control}
          name="eventDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Summary</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Summarize your event, including key moments, successes, and thank you notes..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a summary of how the event went to generate a recap post.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Recap Post
        </Button>
      </form>
    </Form>
  );
}
