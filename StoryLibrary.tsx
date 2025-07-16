import React from 'react';
import type { SavedStory } from '../types';
import { BookOpenIcon, PlusCircleIcon, TrashIcon } from './icons';

interface StoryLibraryProps {
  stories: SavedStory[];
  onLoadStory: (story: SavedStory) => void;
  onDeleteStory: (storyId: string) => void;
  onStartNewStory: () => void;
  isLoading: boolean;
}

const StoryLibrary: React.FC<StoryLibraryProps> = ({ stories, onLoadStory, onDeleteStory, onStartNewStory, isLoading }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <BookOpenIcon className="w-8 h-8 text-blue-600"/>
          My Stories
        </h2>
        <button
          onClick={onStartNewStory}
          className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
        >
          <PlusCircleIcon className="w-6 h-6"/>
          <span>New Story</span>
        </button>
      </div>
      
      {isLoading && <p>Loading stories...</p>}
      
      {!isLoading && stories.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          <p className="mb-4 text-lg">You haven't created any stories yet.</p>
          <p>Click "New Story" to get started!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {stories.map(story => (
            <li key={story.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition group">
              <button onClick={() => onLoadStory(story)} className="flex-grow text-left">
                <p className="font-semibold text-slate-800">{story.title}</p>
                <p className="text-sm text-slate-500">
                  Created on {new Date(story.createdAt?.toDate()).toLocaleDateString()}
                </p>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }}
                className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete story"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StoryLibrary;
