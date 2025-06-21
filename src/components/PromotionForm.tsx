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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { runGenerateSocialMediaPosts, runExtractEventDetails } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { GeneratedContent } from './PostPreviews';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { EventPreviewCard } from './EventPreviewCard';
import type { ExtractEventDetailsOutput } from '@/ai/flows/extract-event-details-from-url';
import { Label } from '@/components/ui/label';

const platforms = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'threads', label: 'Threads' },
] as const;

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  date: z.string().min(1, 'Date is required.'),
  time: z.string().min(1, 'Time is required.'),
  location: z.string().min(2, 'Location is required.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  targetAudience: z.string().min(3, 'Target audience is required.'),
  tone: z.enum(['professional', 'casual', 'inspirational']),
  platforms: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one platform.',
  }),
  hashtags: z.string().optional(),
});

type PromotionFormValues = z.infer<typeof formSchema>;

interface PromotionFormProps {
  setIsLoading: (isLoading: boolean) => void;
  setGeneratedContent: (content: GeneratedContent) => void;
}

export function PromotionForm({ setIsLoading, setGeneratedContent }: PromotionFormProps) {
  const { toast } = useToast();
  const [eventUrl, setEventUrl] = React.useState('');
  const [isFetchingUrl, setIsFetchingUrl] = React.useState(false);
  const [fetchedDetails, setFetchedDetails] = React.useState<ExtractEventDetailsOutput | null>(null);
  
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      targetAudience: '',
      tone: 'casual',
      platforms: ['x', 'instagram'],
      hashtags: '',
    },
  });

  const { isSubmitting } = form.formState;

  const handleFetchUrl = async () => {
    if (!eventUrl || !/^(https?:\/\/)/.test(eventUrl)) {
      toast({ variant: 'destructive', title: 'Please enter a valid URL.' });
      return;
    }
    setIsFetchingUrl(true);
    setFetchedDetails(null);
    const result = await runExtractEventDetails({ url: eventUrl });
    setIsFetchingUrl(false);

    if (result.error || !result.data) {
      toast({
        variant: 'destructive',
        title: 'Error Fetching URL',
        description: result.error || 'Could not extract event details. Please fill the form manually.',
      });
    } else {
      setFetchedDetails(result.data);
      toast({
        title: 'Event Details Fetched!',
        description: 'Review the details and confirm to fill the form.',
      });
    }
  };

  const handleConfirmAndFill = (details: ExtractEventDetailsOutput) => {
    let formattedDate = '';
    if (details.date) {
        try {
            const dateObj = new Date(details.date);
            if (!isNaN(dateObj.getTime())) {
                const tzoffset = dateObj.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(dateObj.getTime() - tzoffset)).toISOString().split('T')[0];
                formattedDate = localISOTime;
            }
        } catch (e) {
            console.warn("Could not parse date from URL:", details.date);
        }
    }
    
    form.reset({
      ...form.getValues(),
      title: details.title || '',
      date: formattedDate,
      time: details.time || '',
      location: details.location || '',
      description: `${details.description || ''}\n\nRegister here: ${details.registrationUrl || eventUrl}`.trim(),
    });
    setFetchedDetails(null);
    setEventUrl('');
  };

  const handleClearPreview = () => {
    setFetchedDetails(null);
    setEventUrl('');
  };


  async function onSubmit(values: PromotionFormValues) {
    setIsLoading(true);
    setGeneratedContent(null);
    const result = await runGenerateSocialMediaPosts({
        ...values,
        hashtags: values.hashtags || '',
    });
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Posts',
        description: result.error,
      });
    } else {
      setGeneratedContent(result.data || null);
       toast({
        title: 'Posts Generated!',
        description: 'Your social media posts are ready.',
      });
    }
  }

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="event-url">Paste Event URL</Label>
            <div className="flex gap-2">
            <Input
                id="event-url"
                placeholder="e.g., https://luma.com/..."
                value={eventUrl}
                onChange={(e) => setEventUrl(e.target.value)}
                disabled={isFetchingUrl}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFetchUrl();
                    }
                }}
            />
            <Button onClick={handleFetchUrl} disabled={isFetchingUrl || !eventUrl} type="button" className="shrink-0">
                {isFetchingUrl && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch & Fill
            </Button>
            </div>
            <p className="text-sm text-muted-foreground">
             From Eventbrite, Luma, Meetup, etc. We'll try to auto-fill the form.
            </p>
        </div>

        {fetchedDetails ? (
            <div className="my-6">
                <EventPreviewCard 
                    eventDetails={fetchedDetails}
                    onConfirm={handleConfirmAndFill}
                    onClear={handleClearPreview}
                />
            </div>
        ) : (
            <>
                <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
                        OR
                    </span>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <h3 className="text-xl font-headline font-semibold">Enter Details Manually</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Event Title</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Annual Tech Conference 2024" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Virtual or 123 Main St, Anytown" {...field} />
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Describe your event in detail..."
                                className="min-h-[120px]"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="targetAudience"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Target Audience</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Developers, Entrepreneurs" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tone"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tone of Voice</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select a tone" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="inspirational">Inspirational</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>

                        <FormField
                        control={form.control}
                        name="platforms"
                        render={() => (
                            <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Platforms</FormLabel>
                                <FormDescription>
                                Select the platforms you want to generate posts for.
                                </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {platforms.map((item) => (
                                <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="platforms"
                                    render={({ field }) => {
                                    return (
                                        <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                        <FormControl>
                                            <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...(field.value || []), item.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                        (value) => value !== item.id
                                                    )
                                                    );
                                            }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {item.label}
                                        </FormLabel>
                                        </FormItem>
                                    );
                                    }}
                                />
                                ))}
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        
                        <FormField
                        control={form.control}
                        name="hashtags"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Hashtags (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="#Tech #Innovation #Future" {...field} />
                            </FormControl>
                            <FormDescription>
                                Comma-separated hashtags. You can also get smart suggestions.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Posts
                        </Button>
                    </form>
                </Form>
            </>
        )}
    </div>
  );
}
