'use server';

import { generateSocialMediaPosts, type GenerateSocialMediaPostsInput } from '@/ai/flows/generate-social-media-posts';
import { generateEventRecapPost, type GenerateEventRecapPostInput } from '@/ai/flows/generate-event-recap-post';
import { extractEventDetailsFromUrl, type ExtractEventDetailsInput } from '@/ai/flows/extract-event-details-from-url';

export async function runGenerateSocialMediaPosts(input: GenerateSocialMediaPostsInput) {
  try {
    const result = await generateSocialMediaPosts(input);
    return { data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { error: `Failed to generate posts: ${errorMessage}` };
  }
}

export async function runGenerateEventRecapPost(input: GenerateEventRecapPostInput) {
  try {
    const result = await generateEventRecapPost(input);
    return { data: result.recapPost };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { error: `Failed to generate recap: ${errorMessage}` };
  }
}

export async function runExtractEventDetails(input: ExtractEventDetailsInput) {
  try {
      const result = await extractEventDetailsFromUrl(input);
      return { data: result };
  } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { error: `Failed to extract event details: ${errorMessage}` };
  }
}
