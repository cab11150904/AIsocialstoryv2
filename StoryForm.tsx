import React, { useRef } from 'react';
import type { StoryGenerationParams } from '../types';
import { SparklesIcon, PhotoIcon, XCircleIcon } from './icons';

interface StoryFormProps {
  formData: StoryGenerationParams;
  setFormData: React.Dispatch<React.SetStateAction<StoryGenerationParams>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const StoryForm: React.FC<StoryFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, uploadedImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, uploadedImage: null }));
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg h-full">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Create a Social Story</h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2">Child's Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="childName" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input type="text" id="childName" name="childName" value={formData.childName} onChange={handleChange} placeholder="e.g., Alex" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-900" required />
                </div>
                <div>
                    <label htmlFor="childAge" className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input type="text" id="childAge" name="childAge" value={formData.childAge} onChange={handleChange} placeholder="e.g., 5" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-900" required />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="childGender" className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select id="childGender" name="childGender" value={formData.childGender} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-900" required>
                        <option value="">Select...</option>
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                        <option value="child">Child (Neutral)</option>
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Character Photo</label>
                   <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-[42px] px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2"
                    >
                      <PhotoIcon className="w-5 h-5"/>
                      <span>Upload Photo</span>
                    </button>
                </div>
            </div>
             {formData.uploadedImage && (
                <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden shadow-md">
                    <img src={formData.uploadedImage} alt="Character preview" className="w-full h-full object-cover" />
                    <button 
                        type="button"
                        onClick={clearImage}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/75 transition"
                        aria-label="Remove image"
                    >
                        <XCircleIcon className="w-6 h-6"/>
                    </button>
                </div>
            )}
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2">Story Details</h3>
            <div>
            <label htmlFor="socialConcept" className="block text-sm font-medium text-slate-700 mb-1">Concept to Learn</label>
            <input type="text" id="socialConcept" name="socialConcept" value={formData.socialConcept} onChange={handleChange} placeholder="e.g., Sharing toys with friends" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-900" required />
            </div>
            <div>
            <label htmlFor="situation" className="block text-sm font-medium text-slate-700 mb-1">Situation / Challenge</label>
            <textarea id="situation" name="situation" value={formData.situation} onChange={handleChange} placeholder="e.g., At the playground, another child took the toy and they hit them." rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-900" required />
            </div>
        </div>


        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105">
          {isLoading ? 'Creating...' : <><SparklesIcon className="w-5 h-5" /> Generate Story</>}
        </button>
      </form>
    </div>
  );
};

export default StoryForm;