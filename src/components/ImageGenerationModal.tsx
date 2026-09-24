import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Download, 
  Maximize2, 
  Send, 
  Lightbulb, 
  RotateCcw,
  Palette,
  Eye,
  Check
} from 'lucide-react';
import { SubjectType } from '../types';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMidnight: boolean;
  activeSubject: SubjectType;
  activeChapterName: string;
  onSendToChat?: (imagePrompt: string, imageUrl?: string, svgContent?: string) => void;
}

export const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  onClose,
  isMidnight,
  activeSubject,
  activeChapterName,
  onSendToChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    imageUrl?: string;
    svgContent?: string;
    prompt: string;
    type: 'raster' | 'svg';
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Chapter-specific suggestions
  const getSubjectSuggestions = () => {
    switch (activeSubject) {
      case 'Science':
        return [
          `Diagram of Human Eye showing Cornea, Iris, Pupil, Lens, and Retina`,
          `Ray diagram of Refraction of light through a triangular glass prism`,
          `Structure of a Nephron with Bowman's capsule and collecting duct`,
          `Experimental setup for the Electrolysis of acidulated water`,
          `Magnetic field lines pattern around a current-carrying solenoid`,
          `Diagram of Stomatal pore open and closed condition`
        ];
      case 'Mathematics':
        return [
          `Basic Proportionality Theorem (BPT) triangle ABC with DE parallel to BC`,
          `3D Frustum of a cone with radii r1, r2 and slant height l`,
          `Right-angled triangle showing angle of elevation theta for heights and distances`,
          `Cartesian coordinate plane showing 4 quadrants and sign conventions`,
          `Circle with two tangents drawn from an external point P`
        ];
      case 'Social Science':
        return [
          `Outline sketch map of India highlighting major soil types`,
          `Flowchart of the 3 tiers of Indian Panchayati Raj & Federalism`,
          `Dandi March historic salt satyagraha route map illustration`,
          `Sectors of the Indian Economy: Primary, Secondary, and Tertiary Venn diagram`
        ];
      default:
        return [
          `Educational board exam illustration of "${activeChapterName}"`,
          `Concept map diagram for "${activeChapterName}" with key terms`,
          `Step-by-step flowchart for chapter "${activeChapterName}"`
        ];
    }
  };

  const suggestions = getSubjectSuggestions();

  const handleGenerate = async (customPrompt?: string) => {
    const textToGenerate = customPrompt || prompt;
    if (!textToGenerate.trim()) {
      setError('Please enter a description for the image to generate.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToGenerate.trim(),
          aspectRatio,
          subject: activeSubject,
          chapter: activeChapterName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate image');
      }

      const result = await response.json();
      setGeneratedResult(result);
    } catch (err: any) {
      console.error('Image generation failed:', err);
      setError(err.message || 'Image generation failed. Please try a different description.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedResult) return;

    if (generatedResult.imageUrl) {
      const a = document.createElement('a');
      a.href = generatedResult.imageUrl;
      a.download = `CBSE-Image-${Date.now()}.png`;
      a.click();
    } else if (generatedResult.svgContent) {
      const blob = new Blob([generatedResult.svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CBSE-Diagram-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleInsertChat = () => {
    if (!generatedResult || !onSendToChat) return;
    onSendToChat(
      generatedResult.prompt,
      generatedResult.imageUrl,
      generatedResult.svgContent
    );
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isMidnight 
            ? 'bg-slate-900 border-slate-700/80 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isMidnight ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Image Generation
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-500 border border-sky-500/30">
                  AI Visuals
                </span>
              </div>
              <p className="text-xs opacity-60">
                Generate high-yield educational diagrams, anatomy sketches &amp; figures for CBSE Class 10
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
              isMidnight ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Prompt input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Diagram / Image Description</span>
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe the diagram or image you want to generate (e.g. "Cross-section of human heart showing atria and ventricles with clear labels")...`}
                rows={3}
                className={`w-full p-3.5 rounded-2xl text-xs sm:text-sm border resize-none outline-none transition-all ${
                  isMidnight
                    ? 'bg-slate-800/80 border-slate-700 focus:border-sky-500 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Quick presets for this chapter */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold opacity-75">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Class 10 CBSE Recommended Visuals ({activeSubject}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(sug);
                    handleGenerate(sug);
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border text-left transition-all ${
                    isMidnight
                      ? 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                      : 'bg-slate-100/70 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect ratio */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold opacity-75">Aspect Ratio:</span>
            <div className="flex items-center gap-1.5">
              {(['1:1', '16:9', '4:3'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                    aspectRatio === ratio
                      ? isMidnight
                        ? 'bg-sky-500 text-white border-sky-400'
                        : 'bg-sky-600 text-white border-sky-600'
                      : isMidnight
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              isGenerating || !prompt.trim()
                ? 'opacity-50 cursor-not-allowed bg-slate-300 dark:bg-slate-800 text-slate-500'
                : 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:brightness-110 active:scale-[0.99] text-white'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Image with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Image</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Generated Result Container */}
          {generatedResult && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isMidnight ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Image Generated</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isMidnight ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-white border-slate-300 hover:bg-slate-100'
                    }`}
                    title="Download Diagram"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  {onSendToChat && (
                    <button
                      onClick={handleInsertChat}
                      className="p-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all"
                      title="Insert into Chat"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{copied ? 'Added!' : 'Add to Chat'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Image / SVG Display */}
              <div className={`w-full rounded-xl overflow-hidden border flex items-center justify-center p-2 ${
                isMidnight ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                {generatedResult.imageUrl ? (
                  <img
                    src={generatedResult.imageUrl}
                    alt={generatedResult.prompt}
                    className="max-h-[350px] w-auto object-contain rounded-lg shadow-sm"
                  />
                ) : generatedResult.svgContent ? (
                  <div
                    className="w-full max-h-[350px] flex items-center justify-center overflow-auto p-1"
                    dangerouslySetInnerHTML={{ __html: generatedResult.svgContent }}
                  />
                ) : null}
              </div>

              <p className="text-[11px] opacity-70 italic">
                "{generatedResult.prompt}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
