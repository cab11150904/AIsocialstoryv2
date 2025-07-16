import React, { useState, useRef } from 'react';
import type { StoryPage } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, DocumentArrowDownIcon, PencilIcon, CheckIcon } from './icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface StoryViewerProps {
  storyPages: StoryPage[];
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  currentPageIndex: number;
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
  onStartOver: () => void;
  childName: string;
  onPageTextChange: (pageIndex: number, newText: string) => void;
  storyTitle: string;
  coverPageImageUrl: string | null;
}

const ImagePlaceholder: React.FC = () => (
    <div className="w-full aspect-square bg-slate-200 rounded-xl flex items-center justify-center animate-pulse">
        <div className="text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    </div>
);

const StoryViewer: React.FC<StoryViewerProps> = ({
  storyPages,
  isLoading,
  loadingMessage,
  error,
  currentPageIndex,
  setCurrentPageIndex,
  onStartOver,
  childName,
  onPageTextChange,
  storyTitle,
  coverPageImageUrl,
}) => {
  const currentPage = storyPages[currentPageIndex];
  const printableRef = useRef<HTMLDivElement>(null);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const goToPrevious = () => {
    setCurrentPageIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentPageIndex(prev => Math.min(storyPages.length - 1, prev + 1));
  };

  const handleSaveAsPdf = async () => {
    if (isSavingPdf) return;
    if(isEditing) setIsEditing(false);

    const storyElement = printableRef.current;
    if (!storyElement) return;

    setIsSavingPdf(true);

    storyElement.classList.remove('hidden');
    storyElement.classList.add('fixed', 'top-0', 'left-[-9999px]', 'z-[-1]');

    try {
        const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: 'letter', compress: true });
        const pageElements = storyElement.querySelectorAll('.printable-page-pdf');
        
        for (let i = 0; i < pageElements.length; i++) {
            const page = pageElements[i] as HTMLElement;
            const canvas = await html2canvas(page, { scale: 1.5, useCORS: true, allowTaint: true });
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
            
            if (i < pageElements.length - 1) pdf.addPage();
        }
        
        const fileName = storyTitle ? `${storyTitle.replace(/ /g, '_')}.pdf` : (childName.trim() ? `${childName.replace(/ /g, '_')}_Story.pdf` : 'Social_Story.pdf');
        pdf.save(fileName);
    } catch (err) {
        console.error("Failed to generate PDF:", err);
    } finally {
        storyElement.classList.add('hidden');
        storyElement.classList.remove('fixed', 'top-0', 'left-[-9999px]', 'z-[-1]');
        setIsSavingPdf(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-slate-600 font-medium">{loadingMessage}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center">
            <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg mb-4">{error}</p>
            <button
                onClick={onStartOver}
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Start Over
            </button>
        </div>
      );
    }
    
    if (storyPages.length === 0) {
      return (
        <div className="text-center text-slate-500">
          <SparklesIcon className="w-16 h-16 mx-auto text-amber-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">Your story will appear here!</h3>
          <p className="mt-2">Fill out the form to get started.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* PDF generation structure */}
        <div ref={printableRef} className="hidden">
           {coverPageImageUrl && storyTitle && (
              <div className="printable-page-pdf bg-white flex flex-col items-center justify-center text-black p-24 box-border" style={{ width: '816px', height: '1056px' }}>
                <h1 className="text-center font-bold mb-12" style={{ fontSize: '42pt', fontFamily: 'serif' }}>{storyTitle}</h1>
                <img src={coverPageImageUrl} alt={`Cover for ${storyTitle}`} className="object-contain mb-8 shadow-2xl rounded-lg" style={{ maxWidth: '600px', maxHeight: '600px' }} crossOrigin="anonymous"/>
                <p className="text-center mt-auto" style={{ fontSize: '18pt' }}>By {childName}</p>
              </div>
            )}
          {storyPages.map((page, index) => (
             <div key={`pdf-${index}`} className="printable-page-pdf bg-white flex flex-col items-center justify-center text-black p-24 box-border" style={{ width: '816px', height: '1056px' }}>
              {page.imageUrl && ( <img src={page.imageUrl} alt={`Illustration for page ${index + 1}`} className="object-contain mb-12" style={{ maxWidth: '624px', maxHeight: '624px' }} crossOrigin="anonymous"/> )}
              <p className="text-center" style={{ fontSize: '18pt' }}>{page.pageText}</p>
            </div>
          ))}
        </div>

        {/* Interactive screen viewer */}
        <div className="flex-grow flex flex-col items-center">
          <div className="w-full max-w-md aspect-square mb-4 transition-all duration-300 ease-in-out relative">
            {currentPage.imageUrl ? (
                <>
                    <img src={currentPage.imageUrl} alt={currentPage.imagePrompt || `Illustration for page ${currentPageIndex + 1}`} className="w-full h-full object-cover rounded-xl shadow-md" />
                </>
            ) : (
                <ImagePlaceholder />
            )}
          </div>
          <div className="text-lg md:text-xl text-center text-slate-700 flex-shrink-0 min-h-[6rem] w-full">
            {isEditing ? (
              <textarea value={currentPage.pageText} onChange={(e) => onPageTextChange(currentPageIndex, e.target.value)} className="w-full h-full bg-slate-100 border border-blue-300 rounded-lg p-2 text-center resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition" rows={4} aria-label="Editable story text"/>
            ) : (
              <p className="p-2">{currentPage.pageText}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <button onClick={goToPrevious} disabled={currentPageIndex === 0} className="p-4 rounded-full bg-white shadow-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition" aria-label="Previous Page">
            <ChevronLeftIcon className="w-7 h-7 text-slate-700"/>
          </button>
          
          <span className="text-sm font-medium text-slate-500">
            Page {currentPageIndex + 1} of {storyPages.length}
          </span>
          
          <button onClick={goToNext} disabled={currentPageIndex === storyPages.length - 1} className="p-4 rounded-full bg-white shadow-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition" aria-label="Next Page">
            <ChevronRightIcon className="w-7 h-7 text-slate-700"/>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button onClick={onStartOver} className="col-span-full sm:col-span-1 bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                New Story
            </button>
            <button onClick={() => setIsEditing(!isEditing)} className="bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                {isEditing ? <><CheckIcon className="w-5 h-5"/> Done</> : <><PencilIcon className="w-5 h-5"/> Edit</>}
            </button>
            <button onClick={handleSaveAsPdf} disabled={isSavingPdf} className="bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400">
                {isSavingPdf ? 'Saving...' : <><DocumentArrowDownIcon className="w-5 h-5"/> PDF</>}
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl shadow-lg flex items-center justify-center min-h-[calc(100vh-12rem)]">
      {renderContent()}
    </div>
  );
};

export default StoryViewer;