import React, { useState, useCallback } from 'react';
import StoryForm from './components/StoryForm';
import StoryViewer from './components/StoryViewer';
import type { StoryPage, StoryGenerationParams } from './types';
import { generateStoryFromText, generateImageFromPrompt, generateDescriptionFromImage } from './services/storyService';
import { SparklesIcon } from './components/icons';
import { Part } from '@google/genai';

const EMPTY_FORM_DATA: StoryGenerationParams = {
  childName: '',
  childAge: '',
  childGender: '',
  uploadedImage: null,
  socialConcept: '',
  situation: '',
};

function App() {
  const [formData, setFormData] = useState<StoryGenerationParams>(EMPTY_FORM_DATA);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [coverPageImageUrl, setCoverPageImageUrl] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const handleStartOver = useCallback(() => {
    setFormData(EMPTY_FORM_DATA);
    setStoryPages([]);
    setStoryTitle('');
    setCoverPageImageUrl(null);
    setError(null);
    setCurrentPageIndex(0);
    setIsGenerating(false);
    setLoadingMessage('');
  }, []);

  const handlePageTextChange = useCallback((pageIndex: number, newText: string) => {
    setStoryPages(currentPages =>
      currentPages.map((page, index) =>
        index === pageIndex ? { ...page, pageText: newText } : page
      )
    );
  }, []);

  const handleGenerateStory = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    if (!formData.uploadedImage) {
        setError("Please upload a photo of the main character.");
        return;
    }
    setIsGenerating(true);
    setError(null);
    setStoryPages([]);
    setCurrentPageIndex(0);
    setStoryTitle('');
    setCoverPageImageUrl(null);

    try {
      setLoadingMessage(`Analyzing character photo...`);
      const match = formData.uploadedImage.match(/data:(.*);base64,(.*)/);
      if (!match) throw new Error("Invalid image format.");
      
      const [, mimeType, data] = match;
      const imagePart: Part = { inlineData: { mimeType, data } };
      
      const desc = await generateDescriptionFromImage(imagePart);
      
      setLoadingMessage(`Crafting story for ${formData.childName || 'your child'}...`);
      const storyOutline = await generateStoryFromText(formData);
      setStoryTitle(storyOutline.title);

      const pagesWithPlaceholders: StoryPage[] = storyOutline.pages.map((page, index) => ({ ...page, id: index }));
      setStoryPages(pagesWithPlaceholders);
      
      setLoadingMessage('Creating a beautiful cover page...');
      const coverPrompt = `A beautiful children's book cover illustration for a story titled "${storyOutline.title}".
**Scene:** ${storyOutline.coverPageDescription}.
**Character's Look:** The character should consistently look like this: ${desc}.
**Art Style:** A gentle, warm, digital painting style with soft textures and a vibrant, harmonious color palette.`;
      const coverUrl = await generateImageFromPrompt(coverPrompt);
      setCoverPageImageUrl(coverUrl);

      setLoadingMessage('Bringing the story to life...');
      const imagePromises = pagesWithPlaceholders.map((page, index) => {
        const fullImagePrompt = `**Core Directive: Emotion and Action**
This is the most important part. Illustrate the character's facial expression and body language to PERFECTLY match this: **${page.actionAndEmotion}**.
**Visual Consistency:**
- Character Passport: ${desc}.
- Story Setting: ${storyOutline.settingDescription}.
- Key Objects: ${storyOutline.keyObjects.join(', ') || 'None'}.
**Artistic Style:** Gentle, warm, digital painting style.`;
        
        return generateImageFromPrompt(fullImagePrompt).then(imageUrl => ({ ...page, imageUrl, imagePrompt: fullImagePrompt }))
          .catch(err => { console.error(`Failed for page ${index + 1}:`, err); return page; });
      });

      for (let i = 0; i < imagePromises.length; i++) {
        setLoadingMessage(`Generating image ${i + 1} of ${imagePromises.length}...`);
        const updatedPage = await imagePromises[i];
        setStoryPages(currentPages => currentPages.map(p => p.id === updatedPage.id ? updatedPage : p));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
    }
  }, [formData, isGenerating]);

  return (
    <div className="min-h-screen bg-sky-100 font-sans text-slate-800">
      <header className="py-3 bg-sky-100/80 backdrop-blur-sm sticky top-0 z-10 border-b border-sky-200">
        <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <SparklesIcon className="w-8 h-8 text-amber-400" />
                 <h1 className="text-2xl font-bold text-blue-800">Social Story Creator</h1>
            </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="lg:sticky lg:top-24">
                <StoryForm formData={formData} setFormData={setFormData} onSubmit={handleGenerateStory} isLoading={isGenerating}/>
            </div>
            <div>
                <StoryViewer 
                    storyPages={storyPages} 
                    isLoading={isGenerating} 
                    loadingMessage={loadingMessage} 
                    error={error} 
                    currentPageIndex={currentPageIndex} 
                    setCurrentPageIndex={setCurrentPageIndex} 
                    onStartOver={handleStartOver} 
                    childName={formData.childName} 
                    onPageTextChange={handlePageTextChange} 
                    storyTitle={storyTitle} 
                    coverPageImageUrl={coverPageImageUrl}
                />
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;