import { GoogleGenAI, Type, Part } from "@google/genai";
import type { StoryOutlineResponse, StoryGenerationParams } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// --- GEN AI FUNCTIONS ---

export async function generateDescriptionFromImage(imagePart: Part): Promise<string> {
    const model = 'gemini-2.5-flash';
    const prompt = `You are an expert descriptive analyst. Analyze the provided image of a child. Generate a detailed, objective, text-based "passport" description focusing on key visual features for consistent character illustration.
- Do NOT mention the child's name, age, or perceived gender.
- Describe physical appearance only: hair color and style, eye color, skin tone, notable features like freckles or glasses.
- Describe the clothing in detail: type of shirt, color, pattern, pants/skirt, shoes.
- Be factual and concise. This description will be used by an illustrator.
- Example: "A child with short, straight blonde hair, blue eyes, and light skin with a few freckles across the nose. They are wearing a red short-sleeved t-shirt with a small dinosaur graphic on the front, and blue jeans."`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, { text: prompt }] },
            config: { temperature: 0.2 }
        });
        return response.text;
    } catch (error) {
        console.error("Error in generateDescriptionFromImage:", error);
        throw new Error("The AI failed to analyze the image.");
    }
}

export async function generateStoryFromText(params: StoryGenerationParams): Promise<StoryOutlineResponse> {
    const { childName, childAge, childGender, socialConcept, situation } = params;
    if (!childName || !childAge || !childGender || !socialConcept || !situation) {
        throw new Error("Missing required fields for story generation.");
    }
    
    const age = parseInt(childAge, 10);

    let pageCount: number;
    let narrativeArc: string;
    let narrativeComplexity: string;

    if (age <= 3) {
      pageCount = 6;
      narrativeArc = `1. Introduction: Introduce ${childName} in a simple, familiar setting. 2. Inciting Incident: The social challenge occurs (e.g., another child takes a toy). 3. Initial Reaction: ${childName} has a big, simple emotional reaction (e.g., feels sad, cries). 4. Modeling: A caregiver or peer models the desired behavior in one simple step (e.g., "Can I have a turn, please?"). 5. Resolution: The situation is resolved simply (${childName} gets the toy back or finds another). 6. Positive Reinforcement: A simple, positive statement (e.g., "Sharing is fun!").`;
      narrativeComplexity = `Extremely simple. Use 3-6 word sentences. Focus on one core emotion and one simple action. Repetitive phrases are good.`;
    } else if (age >= 4 && age <= 5) {
      pageCount = 8;
      narrativeArc = `1. Introduction: Introduce ${childName} and their desire (e.g., wanting to play with a specific toy). 2. Inciting Incident: The social challenge happens (${situation}). 3. Emotional Reaction: Describe ${childName}'s feeling (e.g., "felt frustrated and angry"). 4. Perspective-Taking (Simple): Briefly mention the other person's perspective (e.g., "Maybe they wanted to play too."). 5. Modeling the Skill: A character (or internal thought) models the target skill (${socialConcept}) with a simple phrase. 6. Attempt: ${childName} tries the new skill (e.g., asks for the toy). 7. Resolution: The situation is resolved positively. 8. Positive Reinforcement: Connects the action to the positive outcome (e.g., "When ${childName} asked nicely, playing together was more fun.").`;
      narrativeComplexity = `Standard. Use simple sentences but introduce connecting words (and, but, so). Acknowledge feelings and a simple 'why' behind actions.`;
    } else { // age 6+
      pageCount = 8;
      narrativeArc = `1. Introduction: Set the scene and introduce ${childName}'s goal or state of mind. 2. Inciting Incident: Describe the social challenge (${situation}) with a bit more context. 3. Emotional Granularity: Describe ${childName}'s complex feelings (e.g., "felt a mix of disappointment and jealousy"). 4. Internal Conflict/Thought: ${childName} thinks about their initial impulse vs. a better choice. 5. Perspective-Taking: Explore the other person's possible feelings or intentions more deeply. 6. Applying the Skill: ${childName} makes a conscious choice to use the social skill (${socialConcept}). 7. Resolution & Consequence: The situation resolves, showing the natural positive consequence of their choice. 8. Reflection/Generalization: ${childName} has a concluding thought about why the skill is useful in general.`;
      narrativeComplexity = `More complex sentences. Introduce concepts like thoughts vs. actions, and cause-and-effect. Use a richer vocabulary for emotions.`;
    }

    const systemInstruction = `You are a warm, empathetic, and skilled writer of social stories for children with developmental needs. Your primary goal is to create a story that is simple, direct, and educational, helping the child understand a specific social situation and learn a positive way to respond.
- **Tone**: Gentle, reassuring, and positive.
- **Perspective**: Use the third person (refer to the main character by name, e.g., "${childName} felt sad").
- **Focus**: The story must directly address the 'Concept to Learn' and the 'Situation/Challenge' provided.
- **Language**: Use age-appropriate language as specified. Avoid idioms, sarcasm, or complex metaphors. Be very literal.
- **Output Format**: You MUST follow the JSON schema provided. Do not add any extra text or formatting outside the JSON structure.
- **Key Task**: For each page, create both the 'pageText' and a corresponding 'actionAndEmotion' summary. The 'actionAndEmotion' is the MOST CRITICAL output as it directly commands an AI illustrator. It must be a visually descriptive phrase detailing the character's specific body language, facial expression, and physical action. Be explicit. Instead of "is sad," write "is sitting on the floor, hugging their knees, with tears in their eyes." Instead of "is happy," write "is jumping up and down with a wide, joyful smile."
- **Setting and Objects**: Ensure the 'settingDescription' and 'keyObjects' you define are consistently used and referenced throughout the page descriptions to maintain visual continuity in illustrations. The 'settingDescription' should be a single, consistent location for the *entire* story.`;
    
    const prompt = `Create a ${pageCount}-page social story for ${childName} (${childGender}, age ${childAge}).
- **Concept to Learn**: ${socialConcept}
- **Situation/Challenge**: ${situation}
- **Narrative Arc and Complexity**: Follow the specific arc and language complexity guidelines for a ${childAge}-year-old.
- **Generate**: A title, a cover page description, a single setting for the whole story, a list of key objects, and ${pageCount} distinct story pages.`;

    const storySchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A creative and simple title for the story." },
            coverPageDescription: { type: Type.STRING, description: `A vibrant and simple visual description for the cover image. Example: 'A happy ${childName} standing on a playground, waving.'` },
            settingDescription: { type: Type.STRING, description: "A single, detailed description of the primary setting for the entire story. This will be used to ensure visual consistency across all illustrations. Example: 'A brightly lit preschool classroom with colorful rugs, a bookshelf filled with books, and a window looking out to a sunny playground.'" },
            keyObjects: { type: Type.ARRAY, description: "A list of 2-3 important objects that might appear in the story. Example: ['a red ball', 'a blue teddy bear']", items: { type: Type.STRING } },
            pages: {
                type: Type.ARRAY,
                description: `An array of exactly ${pageCount} page objects.`,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        pageText: {
                            type: Type.STRING,
                            description: "The text for this page of the story. Must be age-appropriate."
                        },
                        actionAndEmotion: {
                            type: Type.STRING,
                            description: "A visually explicit command for an AI illustrator. Describe the character's body language, facial expression, and action. Example: 'sitting on the floor hugging their knees with tears in their eyes' or 'jumping up and down with a wide, joyful smile'."
                        }
                    },
                    required: ["pageText", "actionAndEmotion"],
                }
            }
        },
        required: ["title", "coverPageDescription", "settingDescription", "keyObjects", "pages"],
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: storySchema,
                temperature: 0.8,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as StoryOutlineResponse;
    } catch (error) {
        console.error("Error in generateStoryFromText:", error);
        throw new Error("The AI failed to generate the story text.");
    }
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Image model did not return an image.");
        }
    } catch (error) {
        console.error("Error in generateImageFromPrompt:", error);
        throw new Error("The AI failed to generate the image.");
    }
}