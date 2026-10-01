export type AgentTool =
  | 'topic_explain'
  | 'quiz_generate'
  | 'study_plan'
  | 'answer_evaluate'
  | 'rag_document_qa'
  | 'web_search'
  | 'general_tutor_chat';

export interface AgentThought {
  intent: string;
  rationale: string;
  selectedTool: AgentTool;
  confidence: number;
  parameters: Record<string, any>;
  steps: string[];
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  sectionTitle?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  sourceType: 'pdf' | 'text' | 'notes';
  chunks: DocumentChunk[];
  uploadedAt: string;
  description?: string;
  pageCount?: number;
  fileName?: string;
}

export interface RetrievedChunk {
  chunk: DocumentChunk;
  similarityScore: number;
  matchingTerms: { term: string; score: number }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface StudyTask {
  id: string;
  title: string;
  durationMinutes: number;
  technique: string;
  completed: boolean;
}

export interface StudyPhase {
  phaseName: string;
  duration: string;
  focus: string;
  tasks: StudyTask[];
}

export interface StudyPlan {
  id: string;
  title: string;
  subject: string;
  targetGoal: string;
  durationWeeks: number;
  hoursPerDay: number;
  overview: string;
  phases: StudyPhase[];
  keyTips: string[];
  createdAt: string;
}

export interface EvaluationResult {
  overallScore: number; // e.g. 8.5 / 10
  gradeBadge: string; // e.g. "A - Excellent"
  criteriaScores: {
    accuracy: number;
    completeness: number;
    clarity: number;
    reasoning: number;
  };
  strengths: string[];
  weaknesses: string[];
  actionableSuggestions: string[];
  modelAnswer: string;
  evaluatorNotes: string;
}

export interface TopicExplanation {
  topic: string;
  coreIntuition: string;
  realWorldAnalogy: string;
  formalBreakdown: {
    title: string;
    description: string;
    equationsOrMechanisms?: string[];
  }[];
  stepByStepGuide: string[];
  commonMisconceptions: { misconception: string; correction: string }[];
  keyTakeaways: string[];
  cheatSheetSummary: string;
}

export interface Citation {
  title: string;
  url?: string;
  snippet?: string;
  sourceType?: 'document' | 'web';
  docId?: string;
  chunkIndex?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  thought?: AgentThought;
  toolUsed?: AgentTool;
  retrievedChunks?: RetrievedChunk[];
  citations?: Citation[];
  quizData?: Quiz;
  studyPlanData?: StudyPlan;
  evaluationData?: EvaluationResult;
  topicData?: TopicExplanation;
}

export interface UserProfile {
  name: string;
  gradeLevel: 'High School' | 'Undergraduate' | 'Graduate' | 'Self-learner';
  learningStyle: 'Visual & Analogies' | 'Intuitive & Practical' | 'Rigorous & Mathematical' | 'Fast & High-Yield';
  activeSubject: string;
  quizzesCompleted: number;
  averageScore: number;
  streakDays: number;
}
