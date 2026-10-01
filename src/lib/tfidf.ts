/**
 * StudyMate AI - Mathematical TF-IDF and Cosine Similarity Engine
 * Used for transparent RAG retrieval over academic documents, lecture notes, and textbooks.
 */

import { DocumentChunk, RetrievedChunk } from '../types';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'it', 'its', 'itself', 'just', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn',
  'we', 'were', 'weren', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with',
  'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

export function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/);

  return words
    .map(w => w.trim().replace(/^[-_]+|[-_]+$/g, ''))
    .filter(w => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

export function chunkDocument(
  docId: string,
  docTitle: string,
  rawText: string,
  chunkSizeWords = 180,
  overlapWords = 35
): DocumentChunk[] {
  // First attempt to split by logical headings or double newlines
  const paragraphs = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const chunks: DocumentChunk[] = [];
  let currentChunkWords: string[] = [];
  let chunkIndex = 0;
  let currentSectionTitle = 'Overview';

  for (const para of paragraphs) {
    // Check if paragraph looks like a section header (short line or starts with #)
    if (para.length < 70 && (para.startsWith('#') || /^[A-Z0-9\s:.-]+$/.test(para) || para.endsWith(':'))) {
      currentSectionTitle = para.replace(/^#+\s*/, '').trim();
    }

    const words = para.split(/\s+/);
    for (const word of words) {
      currentChunkWords.push(word);
      if (currentChunkWords.length >= chunkSizeWords) {
        const chunkText = currentChunkWords.join(' ');
        chunks.push({
          id: `${docId}-chunk-${chunkIndex}`,
          docId,
          docTitle,
          chunkIndex,
          text: chunkText,
          tokenCount: tokenize(chunkText).length,
          sectionTitle: currentSectionTitle
        });
        chunkIndex++;
        // Retain overlap for continuity
        currentChunkWords = currentChunkWords.slice(chunkSizeWords - overlapWords);
      }
    }
  }

  if (currentChunkWords.length > 25) {
    const chunkText = currentChunkWords.join(' ');
    chunks.push({
      id: `${docId}-chunk-${chunkIndex}`,
      docId,
      docTitle,
      chunkIndex,
      text: chunkText,
      tokenCount: tokenize(chunkText).length,
      sectionTitle: currentSectionTitle
    });
  }

  return chunks;
}

export interface TfIdfIndex {
  chunks: DocumentChunk[];
  vocabulary: Map<string, number>; // term -> index
  terms: string[];
  docFreq: Map<string, number>; // term -> number of chunks containing term
  idf: Map<string, number>; // term -> IDF value
  chunkVectors: Map<string, Map<string, number>>; // chunkId -> { term -> weight }
  chunkNorms: Map<string, number>; // chunkId -> L2 norm
  totalDocs: number;
}

export function buildTfIdfIndex(chunks: DocumentChunk[]): TfIdfIndex {
  const N = chunks.length;
  const docFreq = new Map<string, number>();
  const chunkTermCounts = new Map<string, Map<string, number>>();
  const chunkTotalTokens = new Map<string, number>();
  const vocabSet = new Set<string>();

  // 1. Compute Term Frequencies per chunk and Document Frequencies
  for (const chunk of chunks) {
    const tokens = tokenize(chunk.text);
    const counts = new Map<string, number>();
    const seenInThisDoc = new Set<string>();

    for (const t of tokens) {
      vocabSet.add(t);
      counts.set(t, (counts.get(t) || 0) + 1);
      if (!seenInThisDoc.has(t)) {
        seenInThisDoc.add(t);
        docFreq.set(t, (docFreq.get(t) || 0) + 1);
      }
    }

    chunkTermCounts.set(chunk.id, counts);
    chunkTotalTokens.set(chunk.id, tokens.length || 1);
  }

  const terms = Array.from(vocabSet).sort();
  const vocabulary = new Map<string, number>();
  terms.forEach((t, i) => vocabulary.set(t, i));

  // 2. Compute IDF with standard smooth formula: ln((1 + N) / (1 + df)) + 1
  const idf = new Map<string, number>();
  for (const [term, df] of docFreq.entries()) {
    const idfVal = Math.log((1 + N) / (1 + df)) + 1.0;
    idf.set(term, idfVal);
  }

  // 3. Compute TF-IDF weights and L2 norms for each chunk
  const chunkVectors = new Map<string, Map<string, number>>();
  const chunkNorms = new Map<string, number>();

  for (const chunk of chunks) {
    const counts = chunkTermCounts.get(chunk.id) || new Map();
    const totalWords = chunkTotalTokens.get(chunk.id) || 1;
    const weights = new Map<string, number>();
    let sumSquares = 0;

    for (const [term, count] of counts.entries()) {
      // Augmented or normalized term frequency
      const tf = count / totalWords;
      const termIdf = idf.get(term) || 1.0;
      const weight = tf * termIdf;
      weights.set(term, weight);
      sumSquares += weight * weight;
    }

    chunkVectors.set(chunk.id, weights);
    chunkNorms.set(chunk.id, Math.sqrt(sumSquares) || 1.0);
  }

  return {
    chunks,
    vocabulary,
    terms,
    docFreq,
    idf,
    chunkVectors,
    chunkNorms,
    totalDocs: N
  };
}

export function searchCosineSimilarity(
  index: TfIdfIndex,
  query: string,
  topK = 4
): RetrievedChunk[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || index.chunks.length === 0) {
    return [];
  }

  // Calculate Query TF-IDF vector
  const queryCounts = new Map<string, number>();
  for (const t of queryTokens) {
    queryCounts.set(t, (queryCounts.get(t) || 0) + 1);
  }

  const queryWeights = new Map<string, number>();
  let querySumSquares = 0;

  for (const [term, count] of queryCounts.entries()) {
    const tf = count / queryTokens.length;
    // If term is in corpus, use its idf, otherwise fallback smooth value
    const termIdf = index.idf.get(term) || Math.log(1 + index.totalDocs) + 1.0;
    const weight = tf * termIdf;
    queryWeights.set(term, weight);
    querySumSquares += weight * weight;
  }

  const queryNorm = Math.sqrt(querySumSquares) || 1.0;
  const results: RetrievedChunk[] = [];

  for (const chunk of index.chunks) {
    const chunkWeightMap = index.chunkVectors.get(chunk.id);
    const chunkNorm = index.chunkNorms.get(chunk.id) || 1.0;
    if (!chunkWeightMap) continue;

    let dotProduct = 0;
    const matchingTerms: { term: string; score: number }[] = [];

    for (const [qTerm, qWeight] of queryWeights.entries()) {
      const cWeight = chunkWeightMap.get(qTerm);
      if (cWeight !== undefined && cWeight > 0) {
        const contribution = qWeight * cWeight;
        dotProduct += contribution;
        matchingTerms.push({ term: qTerm, score: contribution });
      }
    }

    if (dotProduct > 0) {
      const cosineSim = dotProduct / (queryNorm * chunkNorm);
      matchingTerms.sort((a, b) => b.score - a.score);
      results.push({
        chunk,
        similarityScore: Math.min(1.0, Math.round(cosineSim * 1000) / 1000),
        matchingTerms: matchingTerms.slice(0, 5)
      });
    }
  }

  // Sort descending by similarity score
  results.sort((a, b) => b.similarityScore - a.similarityScore);
  return results.slice(0, topK);
}
