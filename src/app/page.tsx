'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SparklesIcon } from '@/components/icons';
import { PromotionForm } from '@/components/PromotionForm';
import { RecapForm } from '@/components/RecapForm';
import { PostPreviews, type GeneratedContent } from '@/components/PostPreviews';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState<GeneratedContent>(null);
  const [activeTab, setActiveTab] = React.useState('promotion');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setGeneratedContent(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-primary">
              Social Spark
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Select defaultValue="en">
              <SelectTrigger className="w-[120px] h-9 text-xs">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
            AI-Powered Event Posts
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
            Craft the perfect social media buzz for your events. Fill in the
            details and let our AI do the creative work.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="promotion">Promotional Posts</TabsTrigger>
            <TabsTrigger value="recap">Event Recap</TabsTrigger>
          </TabsList>
          <TabsContent value="promotion">
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <PromotionForm
                    setIsLoading={setIsLoading}
                    setGeneratedContent={setGeneratedContent}
                  />
                </CardContent>
              </Card>
              <div className="relative">
                <PostPreviews
                  isLoading={isLoading}
                  content={generatedContent}
                  key={`previews-${activeTab}`}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="recap">
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <RecapForm
                    setIsLoading={setIsLoading}
                    setGeneratedContent={setGeneratedContent}
                  />
                </CardContent>
              </Card>
              <div className="relative">
                <PostPreviews
                  isLoading={isLoading}
                  content={generatedContent}
                  key={`previews-${activeTab}`}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
                Built with Next.js and Genkit.
            </p>
        </div>
      </footer>
    </div>
  );
}
