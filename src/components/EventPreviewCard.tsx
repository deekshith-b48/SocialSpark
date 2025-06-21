'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CalendarIcon, ClockIcon, MapPinIcon, TicketIcon } from 'lucide-react';
import type { ExtractEventDetailsOutput } from '@/ai/flows/extract-event-details-from-url';
import { ScrollArea } from './ui/scroll-area';

interface EventPreviewCardProps {
  eventDetails: ExtractEventDetailsOutput;
  onConfirm: (details: ExtractEventDetailsOutput) => void;
  onClear: () => void;
}

export function EventPreviewCard({ eventDetails, onConfirm, onClear }: EventPreviewCardProps) {
  const { title, description, date, time, location, imageUrl, registrationUrl } = eventDetails;

  return (
    <Card className="shadow-lg border-primary">
      <CardHeader>
        <CardTitle>Event Preview</CardTitle>
        <CardDescription>Confirm the details below to fill the form.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl ? (
          <div className="relative w-full h-48 rounded-md overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt={title || 'Event Image'}
              layout="fill"
              objectFit="cover"
              data-ai-hint="event poster"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        ) : (
          <div className="w-full h-48 rounded-md overflow-hidden bg-muted flex items-center justify-center" data-ai-hint="event poster">
            <p className="text-sm text-muted-foreground">No image found</p>
          </div>
        )}
        <h3 className="text-2xl font-bold font-headline">{title || 'No Title Found'}</h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
            {date && <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground"/> <span>{date}</span></div>}
            {time && <div className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-muted-foreground"/> <span>{time}</span></div>}
            {location && <div className="flex items-center gap-2 col-span-2"><MapPinIcon className="h-4 w-4 text-muted-foreground"/> <span>{location}</span></div>}
        </div>
        
        {description && (
          <div>
            <Label>Description</Label>
            <ScrollArea className="h-24 mt-1">
                <p className="text-sm text-muted-foreground">{description}</p>
            </ScrollArea>
          </div>
        )}

        {registrationUrl && (
            <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                <TicketIcon className="h-4 w-4"/>
                <span>View Registration Link</span>
            </a>
        )}
        
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClear}>
          Clear & Enter Manually
        </Button>
        <Button onClick={() => onConfirm(eventDetails)}>
          Confirm & Fill Form
        </Button>
      </CardFooter>
    </Card>
  );
}
