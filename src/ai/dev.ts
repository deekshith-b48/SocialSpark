import { config } from 'dotenv';
config();

import '@/ai/flows/generate-event-recap-post.ts';
import '@/ai/flows/generate-social-media-posts.ts';
import '@/ai/flows/smart-hashtag-suggestions.ts';
import '@/ai/flows/extract-event-details-from-url.ts';
