import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Layers, 
  BookOpen, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Cpu, 
  Tag, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCode,
  Info,
  FileCheck,
  AlertCircle,
  Loader2,
  File,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DocumentItem, DocumentChunk, RetrievedChunk } from '../types';
import { buildTfIdfIndex, searchCosineSimilarity, chunkDocument } from '../lib/tfidf';

interface RagExplorerProps {
  documents: DocumentItem[];
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onQueryWithAgent: (query: string) => void;
}

export const RagExplorer: React.FC<RagExplorerProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
  onQueryWithAgent
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [testQuery, setTestQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RetrievedChunk[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // New Document Upload modal / state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Computer Science');
  const [newContent, setNewContent] = useState('');
  const [newSourceType, setNewSourceType] = useState<'pdf' | 'notes' | 'text'>('notes');
  const [pdfMeta, setPdfMeta] = useState<{
    fileName: string;
    numPages: number;
    charCount: number;
  } | null>(null);

  // PDF parsing status
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfParseError, setPdfParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collect all chunks across all documents
  const allChunks: DocumentChunk[] = documents.flatMap(d => d.chunks);

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  const handleRunSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testQuery.trim() || allChunks.length === 0) return;

    const index = buildTfIdfIndex(allChunks);
    const results = searchCosineSimilarity(index, testQuery.trim(), 5);
    setSearchResults(results);
    setHasSearched(true);
  };

  // Process File (PDF or Text/Markdown)
  const processUploadedFile = async (file: File) => {
    setPdfParseError(null);

    // If PDF file
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setIsParsingPdf(true);
      setNewSourceType('pdf');

      try {
        const base64 = await readFileAsBase64(file);
        const res = await fetch('/api/rag/parse-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            filename: file.name
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to parse PDF');
        }

        setNewContent(data.text);
        setPdfMeta({
          fileName: file.name,
          numPages: data.numPages,
          charCount: data.characterCount
        });

        // Auto-generate title
        const cleanName = file.name
          .replace(/\.pdf$/i, '')
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        if (!newTitle) {
          setNewTitle(cleanName);
        }
      } catch (err: any) {
        setPdfParseError(err.message || 'Error parsing PDF. Please try a text file or paste content directly.');
      } finally {
        setIsParsingPdf(false);
      }
      return;
    }

    // Standard text or markdown file
    setNewSourceType('text');
    setPdfMeta(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setNewContent(text);
        if (!newTitle) {
          const cleanName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          setNewTitle(cleanName);
        }
      }
    };
    reader.readAsText(file);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleSaveDocument = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const docId = `doc-${Date.now()}`;
    const chunks = chunkDocument(docId, newTitle.trim(), newContent.trim(), 180, 35);

    const newDoc: DocumentItem = {
      id: docId,
      title: newTitle.trim(),
      category: newCategory,
      sourceType: newSourceType,
      pageCount: pdfMeta?.numPages,
      fileName: pdfMeta?.fileName,
      chunks,
      uploadedAt: newSourceType === 'pdf' ? `PDF (${pdfMeta?.numPages || 1} pages)` : 'Custom Upload',
      description: newSourceType === 'pdf'
        ? `Parsed from PDF "${pdfMeta?.fileName || 'document.pdf'}" (${pdfMeta?.numPages} pages) into ${chunks.length} chunks.`
        : `Uploaded with ${chunks.length} extracted semantic chunks.`
    };

    onAddDocument(newDoc);
    setSelectedDocId(docId);
    setShowUploadModal(false);
    resetModalState();
  };

  const resetModalState = () => {
    setNewTitle('');
    setNewContent('');
    setPdfMeta(null);
    setPdfParseError(null);
    setNewSourceType('notes');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                RAG Document Knowledge Base & TF-IDF Explorer
              </h2>
            </div>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              StudyMate AI supports <strong className="text-amber-300">PDF documents</strong>, lecture slides, and notes.
              It breaks files into overlapping semantic chunks, builds a mathematical TF-IDF vocabulary matrix, and computes Cosine Similarity for precise academic retrieval.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetModalState();
                setShowUploadModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-xs shadow-md transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF or Notes</span>
            </button>
          </div>
        </div>

        {/* Global RAG Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 text-[11px]">Indexed Documents</span>
            <p className="text-base font-bold text-white flex items-center gap-1.5">
              <span>{documents.length}</span>
              <span className="text-[10px] text-amber-400 font-normal">
                ({documents.filter(d => d.sourceType === 'pdf').length} PDFs)
              </span>
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 text-[11px]">Total Chunks</span>
            <p className="text-base font-bold text-amber-400 font-mono">{allChunks.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 text-[11px]">Chunk Strategy</span>
            <p className="text-xs font-semibold text-indigo-300">180 words (35 overlap)</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 text-[11px]">Similarity Metric</span>
            <p className="text-xs font-semibold text-emerald-400">Cosine Similarity (L2 Norm)</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Document List & Inspector, Right = Live TF-IDF Search Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Documents & Chunks (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Knowledge Documents</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{documents.length} docs</span>
            </div>

            {/* Document Select List */}
            <div className="space-y-2">
              {documents.map((doc) => {
                const isSelected = doc.id === selectedDoc?.id;
                const isPdf = doc.sourceType === 'pdf';
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/60 text-white shadow-sm'
                        : 'bg-slate-950/60 hover:bg-slate-950 border-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        isPdf
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                          : isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isPdf ? <FileText className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                          <span>{doc.title}</span>
                          {isPdf && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              PDF {doc.pageCount ? `• ${doc.pageCount}p` : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-mono">{doc.chunks.length} chunks</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {documents.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDocument(doc.id);
                          }}
                          title="Remove Document"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Document Details & Chunks */}
          {selectedDoc && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
              <div className="border-b border-slate-800 pb-3 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{selectedDoc.title}</h4>
                    {selectedDoc.sourceType === 'pdf' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        PDF Document
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedDoc.description}</p>
                </div>
                <button
                  onClick={() => onQueryWithAgent(`Explain the main points from our notes on ${selectedDoc.title}`)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-medium transition flex-shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ask Agent</span>
                </button>
              </div>

              {/* Chunk list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Semantic Chunks ({selectedDoc.chunks.length})</span>
                  <span>Avg ~180 tokens/chunk</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedDoc.chunks.map((chunk, idx) => (
                    <div
                      key={chunk.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 text-xs space-y-1 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-amber-400 font-semibold">Chunk #{idx + 1}</span>
                        <span className="text-slate-400">{chunk.sectionTitle || 'General'}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                        {chunk.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live TF-IDF & Cosine Similarity Sandbox (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                <span>Live TF-IDF & Cosine Similarity Sandbox</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter an academic concept or exam query to see real-time vector scoring, term frequency contributions, and ranked retrieved chunks.
              </p>
            </div>

            {/* Search Input */}
            <form onSubmit={handleRunSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="e.g. TLB miss handling, self-attention, ATP synthase proton gradient..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={!testQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>Calculate Similarity</span>
                <Cpu className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Test Queries */}
            <div className="flex flex-wrap gap-1.5 items-center text-xs">
              <span className="text-slate-400 text-[11px]">Quick Tests:</span>
              {[
                'TLB miss overhead and page table walks',
                'Multi-head attention projection matrices',
                'Chemiosmosis proton motive force ATP synthase',
                'Deadlock Banker algorithm safe state'
              ].map((query, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => {
                    setTestQuery(query);
                    const index = buildTfIdfIndex(allChunks);
                    const results = searchCosineSimilarity(index, query, 5);
                    setSearchResults(results);
                    setHasSearched(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 text-[11px] transition"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Search Results */}
            {hasSearched && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    Ranked Results ({searchResults.length} chunks matched)
                  </span>
                  <span className="text-slate-400 text-[11px]">Sorted by Cosine Similarity</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    No chunks exceeded the similarity threshold for this query. Try different technical terms!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((result, rIdx) => {
                      const scorePercent = Math.round(result.similarityScore * 100);
                      const isHighRelevance = result.similarityScore >= 0.2;

                      return (
                        <div
                          key={result.chunk.id}
                          className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition space-y-2.5"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                rIdx === 0
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                #{rIdx + 1}
                              </span>
                              <div>
                                <h5 className="font-bold text-white text-xs">
                                  {result.chunk.docTitle}
                                </h5>
                                <span className="text-[10px] text-slate-400">
                                  Section: {result.chunk.sectionTitle || 'General'} • Chunk #{result.chunk.chunkIndex}
                                </span>
                              </div>
                            </div>

                            {/* Cosine Score Badge */}
                            <div className="text-right">
                              <div className="flex items-center gap-1.5 justify-end">
                                <span className="text-[11px] text-slate-400">Cosine Sim:</span>
                                <span className={`font-mono font-bold text-xs ${
                                  isHighRelevance ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                  {result.similarityScore.toFixed(4)}
                                </span>
                              </div>
                              <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden ml-auto">
                                <div
                                  className={`h-full rounded-full ${
                                    isHighRelevance ? 'bg-emerald-400' : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(5, scorePercent * 1.5))}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Text Snippet */}
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
                            {result.chunk.text}
                          </p>

                          {/* Matching Terms */}
                          {result.matchingTerms.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              <span className="text-slate-500 font-mono text-[10px]">TF-IDF Weights:</span>
                              {result.matchingTerms.map((term, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 font-mono text-[10px]"
                                >
                                  {term.term}: <strong>{term.score.toFixed(3)}</strong>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Ask Agent with this Chunk */}
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => onQueryWithAgent(`Based on ${result.chunk.docTitle}: ${testQuery}`)}
                              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                            >
                              <span>Ask Agent about this chunk</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Formula Explanation Accordion */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>How TF-IDF & Cosine Similarity Works in StudyMate AI</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                1. <strong>Term Frequency (TF):</strong> Evaluates how frequently a technical keyword appears in a chunk relative to chunk length.<br/>
                2. <strong>Inverse Document Frequency (IDF):</strong> Penalizes ubiquitous words and boosts domain-specific terminology across the corpus.<br/>
                3. <strong>Cosine Similarity:</strong> Measures the normalized inner dot product between the query vector and chunk vectors in multi-dimensional space:
                <code className="block mt-1 font-mono text-amber-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px]">
                  Sim(q, d) = ( q · d ) / ( ||q|| * ||d|| )
                </code>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Upload Document / PDF Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <span>Upload Learning Materials (PDF, Markdown, Notes)</span>
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetModalState();
                }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Drag & Drop File Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-950/30'
                  : 'border-slate-700/80 hover:border-amber-500/50 bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.text"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {isParsingPdf ? (
                <div className="flex flex-col items-center justify-center space-y-2 py-2">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <p className="font-semibold text-white text-xs">Parsing PDF document...</p>
                  <p className="text-[11px] text-slate-400">Extracting text, sections, and structural metadata</p>
                </div>
              ) : pdfMeta ? (
                <div className="flex items-center justify-center gap-3 py-1">
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{pdfMeta.fileName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </p>
                    <p className="text-[11px] text-slate-400">
                      📄 {pdfMeta.numPages} pages • {pdfMeta.charCount.toLocaleString()} characters extracted
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs">
                      Drop your <strong className="text-rose-400">PDF file</strong> or course notes here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports <span className="text-rose-300">.pdf</span>, <span className="text-slate-300">.txt</span>, and <span className="text-slate-300">.md</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {/* Error Message if parsing failed */}
            {pdfParseError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">PDF Extraction Notice</p>
                  <p className="text-[11px] text-rose-300/90">{pdfParseError}</p>
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Operating Systems: Chapter 8 Memory Management"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Academic Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Artificial Intelligence">Artificial Intelligence & Data</option>
                  <option value="Biological Sciences">Biological & Life Sciences</option>
                  <option value="Physics & Mathematics">Physics & Mathematics</option>
                  <option value="Medicine & Health">Medicine & Health</option>
                  <option value="Humanities & Social">Humanities & Social Sciences</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-semibold">
                    Extracted Text Content {newContent ? `(${newContent.split(/\s+/).length} words)` : ''}
                  </label>
                </div>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Extracted text will appear here automatically when a PDF or notes file is uploaded. You can also paste text directly..."
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500 resize-none font-sans text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetModalState();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDocument}
                disabled={!newTitle.trim() || !newContent.trim() || isParsingPdf}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Index Chunks for RAG</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
