import React, { useState, useEffect } from 'react';
import { 
  ChatMessage, 
  AgentTool, 
  DocumentItem, 
  DocumentChunk, 
  Quiz, 
  StudyPlan, 
  EvaluationResult, 
  TopicExplanation, 
  UserProfile 
} from './types';
import { getInitialDocuments } from './data/sampleDocuments';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { RagExplorer } from './components/RagExplorer';
import { QuizArena } from './components/QuizArena';
import { StudyPlanView } from './components/StudyPlanView';
import { AnswerEvaluatorView } from './components/AnswerEvaluatorView';
import { TopicExplainerView } from './components/TopicExplainerView';
import { ProfileModal } from './components/ProfileModal';
import { WifiOff, Wifi } from 'lucide-react';
import { buildTfIdfIndex, searchCosineSimilarity } from './lib/tfidf';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [toolMode, setToolMode] = useState<AgentTool | 'auto'>('auto');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Active items across tabs
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);

  // Student Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('studymate_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      name: 'Alex Chen',
      gradeLevel: 'Undergraduate',
      learningStyle: 'Intuitive & Practical',
      activeSubject: 'Computer Systems & Artificial Intelligence',
      quizzesCompleted: 12,
      averageScore: 88,
      streakDays: 5
    };
  });

  // Knowledge Base Documents
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('studymate_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return getInitialDocuments();
  });

  // Save profile and documents to localStorage
  useEffect(() => {
    localStorage.setItem('studymate_user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('studymate_documents', JSON.stringify(documents));
  }, [documents]);

  // All indexed chunks across all documents
  const allChunks: DocumentChunk[] = documents.flatMap(d => d.chunks);

  // Add Document
  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  // Delete Document
  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // Send message in unified Agent Assistant
  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // If browser is offline, perform client-side offline TF-IDF retrieval or guidance
    if (!navigator.onLine) {
      let localRetrieved: any[] = [];
      if (allChunks.length > 0) {
        try {
          const index = buildTfIdfIndex(allChunks);
          localRetrieved = searchCosineSimilarity(index, userText, 3);
        } catch {
          // ignore
        }
      }

      setTimeout(() => {
        const offlineMsg: ChatMessage = {
          id: `msg-${Date.now()}-offline`,
          sender: 'agent',
          text: localRetrieved.length > 0
            ? `**⚡ Offline Mode Notice:** You are currently offline, but StudyMate AI ran a **local TF-IDF & Cosine Similarity search** directly in your browser over your ${allChunks.length} indexed chunks:\n\n` +
              localRetrieved.map((r, i) => `**#${i + 1} ${r.chunk.docTitle}** (Cosine Score: ${r.similarityScore.toFixed(3)})\n${r.chunk.text.slice(0, 180)}...`).join('\n\n')
            : `**⚡ Offline Mode Notice:** Your device is currently offline. While offline, you can continue to use the **RAG Knowledge Base** (local TF-IDF calculations), practice existing questions in the **Quiz Arena**, and track tasks in your **Study Planner**. Dynamic AI model responses will resume once you reconnect.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          retrievedChunks: localRetrieved,
          toolUsed: 'rag_document_qa'
        };
        setMessages(prev => [...prev, offlineMsg]);
        setIsLoading(false);
      }, 250);
      return;
    }

    try {
      const response = await fetch('/api/agent/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          chatHistory: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          activeToolMode: toolMode,
          profile,
          chunks: allChunks
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        text: data.text || 'I analyzed your request and executed the corresponding tool action.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thought: data.thought,
        toolUsed: data.toolUsed,
        retrievedChunks: data.retrievedChunks,
        citations: data.citations,
        quizData: data.quizData,
        studyPlanData: data.studyPlanData,
        evaluationData: data.evaluationData,
        topicData: data.topicData
      };

      if (data.quizData) {
        setActiveQuiz(data.quizData);
      }
      if (data.studyPlanData) {
        setActivePlan(data.studyPlanData);
      }

      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'agent',
        text: `I encountered an issue processing that query: ${err?.message || 'Please try again'}. You can also use the direct tool mode overrides in the header navigation!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated Quiz Generator
  const handleGenerateQuiz = async (
    topic: string,
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
    count: number
  ): Promise<Quiz | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agent/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a ${difficulty} quiz on ${topic}`,
          activeToolMode: 'quiz_generate',
          profile,
          quizConfig: { topic, difficulty, count }
        })
      });
      const data = await response.json();
      if (data.quizData) {
        setActiveQuiz(data.quizData);
        return data.quizData;
      }
      return null;
    } catch (e) {
      console.error('Quiz generation error:', e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated Study Plan Generator
  const handleGeneratePlan = async (
    subject: string,
    weeks: number,
    hours: number
  ): Promise<StudyPlan | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agent/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a study plan for ${subject}`,
          activeToolMode: 'study_plan',
          profile,
          studyConfig: { subject, durationWeeks: weeks, hoursPerDay: hours }
        })
      });
      const data = await response.json();
      if (data.studyPlanData) {
        setActivePlan(data.studyPlanData);
        return data.studyPlanData;
      }
      return null;
    } catch (e) {
      console.error('Plan generation error:', e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated Answer Evaluator
  const handleEvaluateAnswer = async (
    question: string,
    answer: string
  ): Promise<EvaluationResult | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agent/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Evaluate answer',
          activeToolMode: 'answer_evaluate',
          evalQuestion: question,
          evalAnswer: answer,
          profile
        })
      });
      const data = await response.json();
      return data.evaluationData || null;
    } catch (e) {
      console.error('Evaluation error:', e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated Concept Explainer
  const handleExplainTopic = async (topic: string): Promise<TopicExplanation | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agent/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: topic,
          activeToolMode: 'topic_explain',
          profile
        })
      });
      const data = await response.json();
      return data.topicData || null;
    } catch (e) {
      console.error('Topic explain error:', e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to quiz arena with specific quiz
  const handleOpenArenaWithQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setActiveTab('quiz');
  };

  // Query with Agent from Knowledge Base
  const handleQueryWithAgent = (query: string) => {
    setActiveTab('chat');
    handleSendMessage(query);
  };

  // Record completed quiz score
  const handleRecordScore = (score: number, total: number) => {
    setProfile(prev => ({
      ...prev,
      quizzesCompleted: prev.quizzesCompleted + 1,
      averageScore: Math.round(((prev.averageScore * prev.quizzesCompleted) + (score / total * 100)) / (prev.quizzesCompleted + 1))
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Global Header & Nav */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toolMode={toolMode}
        setToolMode={setToolMode}
        profile={profile}
        onOpenProfile={() => setIsModalOpen(true)}
        docCount={documents.length}
        chunkCount={allChunks.length}
      />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-950/80 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2 shadow-inner">
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
          <span>
            <strong>Offline Mode Active:</strong> Local TF-IDF search, Quiz Arena, and cached documents are fully functional. Dynamic AI generation will resume once internet is restored.
          </span>
        </div>
      )}

      {/* Main Tab View */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            toolMode={toolMode}
            setToolMode={setToolMode}
            profile={profile}
            chunks={allChunks}
            onOpenArenaWithQuiz={handleOpenArenaWithQuiz}
            onClearChat={() => setMessages([])}
          />
        )}

        {activeTab === 'rag' && (
          <RagExplorer
            documents={documents}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onQueryWithAgent={handleQueryWithAgent}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizArena
            activeQuiz={activeQuiz}
            onGenerateQuiz={handleGenerateQuiz}
            isGenerating={isLoading}
            chunks={allChunks}
            onRecordScore={handleRecordScore}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanView
            activePlan={activePlan}
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isLoading}
            profile={profile}
          />
        )}

        {activeTab === 'evaluator' && (
          <AnswerEvaluatorView
            onEvaluate={handleEvaluateAnswer}
            isEvaluating={isLoading}
            profile={profile}
          />
        )}

        {activeTab === 'explainer' && (
          <TopicExplainerView
            onExplain={handleExplainTopic}
            isExplaining={isLoading}
            profile={profile}
            onNavigateToQuiz={(t) => {
              setActiveTab('quiz');
              handleGenerateQuiz(t, 'Intermediate', 4);
            }}
          />
        )}
      </main>

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
        docCount={documents.length}
        chunkCount={allChunks.length}
      />

    </div>
  );
}
