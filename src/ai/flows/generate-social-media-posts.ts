// src/ai/flows/generate-social-media-posts.ts
'use server';
/**
 * @fileOverview Generates tailored social media posts for events across platforms.
 *
 * - generateSocialMediaPosts - A function that generates social media posts for different platforms.
 * - GenerateSocialMediaPostsInput - The input type for the generateSocialMediaPosts function.
 * - GenerateSocialMediaPostsOutput - The return type for the generateSocialMediaPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialMediaPostsInputSchema = z.object({
  title: z.string().describe('The title of the event.'),
  description: z.string().describe('A detailed description of the event.'),
  date: z.string().describe('The date of the event (e.g., YYYY-MM-DD).'),
  time: z.string().describe('The time of the event (e.g., HH:MM AM/PM).'),
  targetAudience: z.string().describe('The target audience for the event.'),
  tone: z.string().describe('The desired tone of the social media posts (e.g., professional, casual, inspirational).'),
  platforms: z.array(z.enum(['linkedin', 'x', 'instagram', 'facebook', 'threads'])).describe('The social media platforms to generate posts for.'),
  hashtags: z.string().describe('Relevant hashtags for the event, comma separated.'),
});
export type GenerateSocialMediaPostsInput = z.infer<typeof GenerateSocialMediaPostsInputSchema>;

const GenerateSocialMediaPostsOutputSchema = z.record(z.string(), z.string()).describe('A map of platform to generated post.');
export type GenerateSocialMediaPostsOutput = z.infer<typeof GenerateSocialMediaPostsOutputSchema>;

export async function generateSocialMediaPosts(input: GenerateSocialMediaPostsInput): Promise<GenerateSocialMediaPostsOutput> {
  return generateSocialMediaPostsFlow(input);
}

const generateSocialMediaPostsPrompt = ai.definePrompt({
  name: 'generateSocialMediaPostsPrompt',
  input: {schema: GenerateSocialMediaPostsInputSchema},
  output: {schema: GenerateSocialMediaPostsOutputSchema},
  prompt: `You are a social media expert tasked with generating engaging posts for events.

  Given the following event details, create tailored social media posts for each of the specified platforms.
  The posts should be optimized for each platform, using appropriate formatting, emojis, and hashtags.

  Event Title: {{{title}}}
  Description: {{{description}}}
  Date: {{{date}}}
  Time: {{{time}}}
  Target Audience: {{{targetAudience}}}
  Tone: {{{tone}}}
  Platforms: {{#each platforms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Hashtags: {{{hashtags}}}

  The output should be a JSON object where the keys are the platform names and the values are the generated social media posts.
  Example:
  {
    "linkedin": "Join us for an exciting event! [Event Title] on [Date] at [Time]. [Description] #Event #Networking",
    "x": "[Event Title] - [Date] [Time]! [Description] #Event #[RelevantHashtag]",
    "instagram": "\ud83d\udce8 Announcing: [Event Title]! \ud83d\udccd [Date], [Time]. [Description] #Event #[RelevantHashtag]",
    "facebook": "We're excited to announce [Event Title]! Happening on [Date] at [Time]. [Description] #Event #Community",
    "threads": "[Event Title] - [Date] [Time] - [Description] #Event #[RelevantHashtag]"
  }
  `,
});

const generateSocialMediaPostsFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaPostsFlow',
    inputSchema: GenerateSocialMediaPostsInputSchema,
    outputSchema: GenerateSocialMediaPostsOutputSchema,
  },
  async input => {
    const {output} = await generateSocialMediaPostsPrompt(input);
    return output!;
  }
);

