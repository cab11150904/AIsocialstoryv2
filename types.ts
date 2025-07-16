export interface StoryPage {
  id: number;
  pageText: string;
  actionAndEmotion: string;
  imagePrompt?: string;
  imageUrl?: string;
}

export interface StoryGenerationParams {
  childName: string;
  childAge: string;
  childGender: string;
  uploadedImage: string | null; // base64 encoded image
  socialConcept: string;
  situation: string;
}

export interface StoryOutlineResponse {
  title: string;
  coverPageDescription: string;
  settingDescription: string;
  keyObjects: string[];
  pages: Omit<StoryPage, 'id' | 'imageUrl' | 'imagePrompt'>[];
}

export interface SavedStory {
  id: string;
  title: string;
  createdAt: { toDate: () => Date };
  formData: StoryGenerationParams;
  pages: StoryPage[];
  coverPageImageUrl: string | null;
}
