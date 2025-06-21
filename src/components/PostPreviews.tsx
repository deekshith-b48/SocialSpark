'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Clipboard, CaseSensitive } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GeneratedContent = Record<string, string> | string | null;

interface PostPreviewsProps {
  content: GeneratedContent;
  isLoading: boolean;
}

const platformNames: Record<string, string> = {
    x: 'X (Twitter)',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    facebook: 'Facebook',
    threads: 'Threads'
}

export function PostPreviews({ content, isLoading }: PostPreviewsProps) {
  const [editedContent, setEditedContent] = React.useState<GeneratedContent>({});
  const { toast } = useToast();

  React.useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  const handleContentChange = (key: string, value: string) => {
    if (typeof editedContent === 'object' && editedContent !== null) {
      setEditedContent({ ...editedContent, [key]: value });
    } else {
        setEditedContent(value);
    }
  };

  if (isLoading) {
    return (
      <Card className="sticky top-24 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card className="sticky top-24 shadow-lg flex items-center justify-center h-96 border-dashed">
        <div className="text-center text-muted-foreground">
          <Bot className="mx-auto h-12 w-12" />
          <p className="mt-4 font-semibold">Your generated posts will appear here.</p>
          <p className="text-sm">Fill out the form to get started.</p>
        </div>
      </Card>
    );
  }

  const renderContent = (key: string, value: string, isSingle: boolean) => (
    <div key={key} className="space-y-3">
       {!isSingle && <label className="font-medium font-headline">{platformNames[key] || key}</label>}
      <Textarea
        value={value}
        onChange={(e) => handleContentChange(key, e.target.value)}
        className="min-h-[200px] text-base"
      />
      <Button onClick={() => handleCopy(value)} variant="outline" size="sm">
        <Clipboard className="mr-2 h-4 w-4" />
        Copy Post
      </Button>
    </div>
  );
  
  return (
    <Card className="sticky top-24 shadow-lg bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Bot />
          AI Generated Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        {typeof editedContent === 'string' && renderContent('recap', editedContent, true)}
        {typeof editedContent === 'object' && editedContent !== null && (
          <Tabs defaultValue={Object.keys(editedContent)[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                {Object.keys(editedContent).map(key => (
                    <TabsTrigger key={key} value={key} className="capitalize text-xs px-2">
                        {platformNames[key] || key}
                    </TabsTrigger>
                ))}
            </TabsList>
            {Object.entries(editedContent).map(([key, value]) => (
                 <TabsContent key={key} value={key} className="mt-4">
                    {renderContent(key, value, false)}
                 </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
