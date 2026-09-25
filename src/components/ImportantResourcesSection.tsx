import React, { useState } from 'react';
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  FileText, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Bookmark, 
  ShieldCheck, 
  School,
  GraduationCap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SubjectType } from '../types';

interface ImportantResourcesSectionProps {
  isMidnight: boolean;
  selectedSubject: SubjectType;
  selectedChapterId: string;
}

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  subject: SubjectType | 'All';
  type: 'ncert_pdf' | 'cbse_syllabus' | 'sample_paper' | 'exemplar' | 'guideline';
  url: string;
  officialSource: 'NCERT' | 'CBSE Academic' | 'CBSE Official';
  fileSizeOrFormat: string;
  badge?: string;
  popular?: boolean;
}

const OFFICIAL_RESOURCES: ResourceItem[] = [
  // --- CBSE Official Syllabus Guidelines ---
  {
    id: 'cbse-syl-main',
    title: 'CBSE Secondary School Curriculum (Class 10)',
    description: 'Official CBSE board curriculum document containing subject-wise marks distribution, design of question paper, and annual assessment guidelines.',
    subject: 'All',
    type: 'cbse_syllabus',
    url: 'https://cbseacademic.nic.in/curriculum_2025.html',
    officialSource: 'CBSE Academic',
    fileSizeOrFormat: 'Official Portal / PDF',
    badge: 'Official Syllabus',
    popular: true
  },
  {
    id: 'cbse-sqp-class10',
    title: 'CBSE Official Class 10 Sample Question Papers (SQP & MS)',
    description: 'Official board sample question papers with step-by-step marking schemes for all subjects to understand exact answer evaluation criteria.',
    subject: 'All',
    type: 'sample_paper',
    url: 'https://cbseacademic.nic.in/SQP_CLASSX_2024-25.html',
    officialSource: 'CBSE Academic',
    fileSizeOrFormat: 'Official PDFs with Marking Scheme',
    badge: 'Marking Scheme',
    popular: true
  },
  {
    id: 'cbse-competency-bank',
    title: 'CBSE Competency-Based Question Bank (Class 10)',
    description: 'High-order thinking skills (HOTS), assertion-reasoning, and case-study questions prepared by CBSE experts to prepare for 50% competency pattern.',
    subject: 'All',
    type: 'guideline',
    url: 'https://cbseacademic.nic.in/cba_framework.html',
    officialSource: 'CBSE Academic',
    fileSizeOrFormat: 'Official Resource Bank',
    badge: 'Case Studies'
  },
  {
    id: 'cbse-lab-manual',
    title: 'CBSE Science Practical & Internal Assessment Guidelines',
    description: 'Official laboratory manual, practical experiments list, Viva-Voce rubrics, and 20 marks internal assessment guidelines.',
    subject: 'Science',
    type: 'guideline',
    url: 'https://cbseacademic.nic.in/manuals.html',
    officialSource: 'CBSE Academic',
    fileSizeOrFormat: 'Official Manual PDF',
    badge: 'Internal 20 Marks'
  },

  // --- NCERT Official PDFs: Mathematics ---
  {
    id: 'ncert-math-full',
    title: 'NCERT Class 10 Mathematics Complete Book (English)',
    description: 'Official National Council of Educational Research and Training (NCERT) Class 10 Mathematics textbook.',
    subject: 'Mathematics',
    type: 'ncert_pdf',
    url: 'https://ncert.nic.in/textbook.php?jemh1=0-14',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'Official NCERT PDF',
    badge: 'Core Textbook',
    popular: true
  },
  {
    id: 'ncert-math-exemplar',
    title: 'NCERT Exemplar Problems & Solutions: Mathematics',
    description: 'Challenging multiple-choice, short and long conceptual problems essential for 95+ score in CBSE Board Mathematics (Standard & Basic).',
    subject: 'Mathematics',
    type: 'exemplar',
    url: 'https://ncert.nic.in/exemplar-problems.php?ln=en',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'PDF with Solutions',
    badge: 'HOTS & Exemplar',
    popular: true
  },
  {
    id: 'ncert-math-hindi',
    title: 'NCERT कक्षा 10 गणित (Ganit - Hindi Medium)',
    description: 'हिंदी माध्यम के विद्यार्थियों के लिए राष्ट्रीय शैक्षिक अनुसंधान और प्रशिक्षण परिषद (NCERT) की आधिकारिक पाठ्यपुस्तक।',
    subject: 'Mathematics',
    type: 'ncert_pdf',
    url: 'https://ncert.nic.in/textbook.php?jhmh1=0-14',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'Hindi Medium PDF',
  },

  // --- NCERT Official PDFs: Science ---
  {
    id: 'ncert-science-full',
    title: 'NCERT Class 10 Science Complete Textbook',
    description: 'Complete NCERT Science book covering Physics (Light, Electricity), Chemistry (Chemical Reactions, Carbon), and Biology (Life Processes).',
    subject: 'Science',
    type: 'ncert_pdf',
    url: 'https://ncert.nic.in/textbook.php?jesc1=0-13',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'Official NCERT PDF',
    badge: 'Core Textbook',
    popular: true
  },
  {
    id: 'ncert-science-exemplar',
    title: 'NCERT Exemplar Problems & Diagrams: Science',
    description: 'NCERT laboratory diagrams, reaction setups, ray diagrams, and detailed solutions for Class 10 Science board examinations.',
    subject: 'Science',
    type: 'exemplar',
    url: 'https://ncert.nic.in/exemplar-problems.php?ln=en',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'PDF with Diagrams',
    badge: 'Exemplar & Lab'
  },
  {
    id: 'ncert-science-hindi',
    title: 'NCERT कक्षा 10 विज्ञान (Vigyan - Hindi Medium)',
    description: 'हिंदी माध्यम के छात्रों के लिए कक्षा 10 विज्ञान की आधिकारिक NCERT पाठ्यपुस्तक।',
    subject: 'Science',
    type: 'ncert_pdf',
    url: 'https://ncert.nic.in/textbook.php?jhsc1=0-13',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'Hindi Medium PDF'
  },

  // --- NCERT Official PDFs: Social Science ---
  {
    id: 'ncert-history',
    title: 'NCERT History: India and the Contemporary World - II',
    description: 'Rise of Nationalism in Europe, Nationalism in India, Making of a Global World, and Print Culture.',
    subject: 'Social Science',
    type: 'ncert_pdf',
    url: 'https://ncert.nic.in/textbook.php?jess3=0-5',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'Official PDF',
    badge: 'History'
  },
  {
    id: 'ncert-geography',
    title: 'NCERT Geography: Contemporary India - II',
    description: 'Resources and Development, Forest and Wildlife, Water Resources, Agriculture, Minerals, Manufacturing & Lifelines.',
    subject: 'Social Science',
    type: 'ncert_pdf',
    url: 'https://ncert.nic.in/textbook.php?jess1=0-7',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'Official PDF',
    badge: 'Geography & Maps'
  },
  {
    id: 'ncert-polscience',
    title: 'NCERT Civics: Democratic Politics - II',
    description: 'Power Sharing, Federalism, Gender Religion and Caste, Political Parties, and Outcomes of Democracy.',
    subject: 'Social Science',
    type: 'ncert_pdf',
    url: 'https://ncert.nic.in/textbook.php?jess4=0-5',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'Official PDF',
    badge: 'Civics'
  },
  {
    id: 'ncert-economics',
    title: 'NCERT Economics: Understanding Economic Development',
    description: 'Development, Sectors of the Indian Economy, Money and Credit, Globalisation, and Consumer Rights.',
    subject: 'Social Science',
    type: 'ncert_pdf',
    url: 'https://ncert.nic.in/textbook.php?jess2=0-5',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'Official PDF',
    badge: 'Economics'
  },

  // --- NCERT Official PDFs: English Literature ---
  {
    id: 'ncert-english-firstflight',
    title: 'NCERT English: First Flight (Main Textbook)',
    description: 'All 9 prose stories & 10 poems including A Letter to God, Nelson Mandela, Two Stories about Flying, The Ball Poem, and Amanda.',
    subject: 'English Literature',
    type: 'ncert_pdf',
    url: 'https://ncert.nic.in/textbook.php?jeff1=0-11',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'Prose & Poetry PDF',
    badge: 'First Flight'
  },
  {
    id: 'ncert-english-footprints',
    title: 'NCERT English: Footprints Without Feet (Supplementary)',
    description: 'Complete supplementary reader containing A Triumph of Surgery, The Thief’s Story, The Midnight Visitor, and Bholi.',
    subject: 'English Literature',
    type: 'ncert_pdf',
    url: 'https://ncert.nic.in/textbook.php?jefp1=0-10',
    officialSource: 'NCERT',
    fileSizeOrFormat: 'Supplementary PDF',
    badge: 'Footprints'
  }
];

export const ImportantResourcesSection: React.FC<ImportantResourcesSectionProps> = ({
  isMidnight,
  selectedSubject
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | SubjectType | 'Official Guidelines'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter resources based on selection and search
  const filteredResources = OFFICIAL_RESOURCES.filter(item => {
    // Subject filter
    if (activeFilter === 'Official Guidelines') {
      if (item.type !== 'cbse_syllabus' && item.type !== 'guideline' && item.type !== 'sample_paper') return false;
    } else if (activeFilter !== 'All') {
      if (item.subject !== 'All' && item.subject !== activeFilter) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.officialSource.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section 
      id="important-resources-section"
      className={`rounded-2xl transition-all duration-300 ${
        isMidnight 
          ? 'glass-panel p-6 border border-slate-700/60 shadow-[0_4px_24px_rgba(0,0,0,0.3)]' 
          : 'bg-white p-6 border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)]'
      }`}
    >
      {/* Header with Title and Trust Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className={`text-lg font-extrabold tracking-tight ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
              📚 Important Resources & Official Downloads
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified CBSE & NCERT
            </span>
          </div>
          <p className="text-xs opacity-75 max-w-2xl">
            Direct access to official NCERT e-books, CBSE Board syllabus guidelines, sample question papers, and exemplar problems matching the latest 2024–2026 exam pattern.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NCERT / Syllabus..."
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl font-medium transition-all outline-none ${
              isMidnight 
                ? 'bg-slate-900/90 border border-slate-700 text-white focus:border-indigo-500' 
                : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-indigo-500'
            }`}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['All', 'Mathematics', 'Science', 'Social Science', 'English Literature', 'Official Guidelines'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${
              activeFilter === tab
                ? isMidnight
                  ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-md'
                  : 'bg-slate-900 text-white shadow-sm'
                : isMidnight
                  ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {tab === 'All' ? '🌟 All Resources' : tab}
          </button>
        ))}
      </div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((item) => (
          <div 
            key={item.id}
            className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 group hover:-translate-y-1 ${
              isMidnight 
                ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' 
                : 'bg-slate-50/80 border-slate-200 hover:border-indigo-300 hover:bg-white shadow-xs'
            }`}
          >
            <div>
              {/* Card Meta Header */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  item.officialSource === 'NCERT'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                }`}>
                  {item.officialSource}
                </span>

                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className={`text-sm font-bold leading-snug mb-1.5 transition-colors group-hover:text-indigo-500 ${
                isMidnight ? 'text-white' : 'text-slate-900'
              }`}>
                {item.title}
              </h4>

              {/* Description */}
              <p className="text-xs opacity-75 line-clamp-3 mb-3 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-semibold opacity-60 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {item.fileSizeOrFormat}
              </span>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  isMidnight 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm' 
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                <span>{item.type === 'ncert_pdf' ? 'Download PDF' : 'Open Portal'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Helpful CBSE Exam Tip Banner at the Bottom */}
      <div className={`mt-6 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isMidnight 
          ? 'bg-indigo-950/40 border-indigo-800/50 text-indigo-200' 
          : 'bg-gradient-to-r from-indigo-50 to-sky-50 border-indigo-100 text-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold">💡 Pro Tip for 2024–2026 Board Aspirants</h5>
            <p className="text-[11px] opacity-80 mt-0.5">
              85%+ of CBSE Board Class 10 questions are grounded strictly in NCERT in-text questions and exemplar activities. Download and solve NCERT line-by-line before reference books!
            </p>
          </div>
        </div>

        <a
          href="https://cbseacademic.nic.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-extrabold whitespace-nowrap text-indigo-500 hover:text-indigo-400 flex items-center gap-1 self-end sm:self-center"
        >
          CBSE Academic Portal
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
};
