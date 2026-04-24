/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  RotateCcw, 
  Trophy, 
  Lightbulb, 
  MessageCircle,
  GraduationCap,
  LayoutDashboard,
  Users,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Map,
  UserCheck,
  Calculator,
  Variable,
  Triangle,
  Layers,
  ChevronRight,
  Medal,
  Target,
  Flame,
  Zap,
  Award,
  CalendarDays,
  Star,
  BrainCircuit,
  PlayCircle,
  Dice5,
  Spline,
  Box,
  ArrowUpRight,
  FastForward
} from 'lucide-react';
import Latex from 'react-latex-next';
import { SKILL_TREE, SYLLABUS_STAGES, DIAGNOSTIC_QUESTIONS, VIDEO_REFERENCES } from './constants';
import { MOCK_STUDENTS, Topic, Level, Bite } from './types';
import { auth, db, signIn } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, increment, serverTimestamp } from 'firebase/firestore';
import { generateLevelContent } from './services/aiService';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'student' | 'analytics'>('student');
  const [step, setStep] = useState<'welcome' | 'diagnostic' | 'tree' | 'learning' | 'mastery'>('welcome');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [currentBiteIndex, setCurrentBiteIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [unlockedNext, setUnlockedNext] = useState(false);
  const [userMastery, setUserMastery] = useState<string[]>([]); // Array of level IDs mastered
  const [points, setPoints] = useState(0);
  const [streak] = useState(5);
  const [isGenerated, setIsGenerated] = useState(false);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);

  // Adaptive Learning State
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [adaptivePrompt, setAdaptivePrompt] = useState<string | null>(null);

  // Sync User Profile
  useEffect(() => {
    let unsubSnapshot: () => void;
    
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        unsubSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
            // Sync point/mastery from profile
            setPoints(docSnap.data().points || 0);
            setUserMastery(docSnap.data().mastery || []);
          } else {
            // New user init
            const newProfile = {
              uid: u.uid,
              name: u.displayName || 'Student',
              points: 0,
              streak: 5,
              mastery: [],
              badges: [],
              generatedCount: 0,
              isDiagnosticComplete: false,
              assignedLevel: 'Not Assigned'
            };
            setDoc(userRef, newProfile).catch(e => console.error("Profile Init Error:", e));
          }
        }, (error) => {
          console.error("Profile Snapshot Error:", error);
        });
      } else {
        setUserProfile(null);
        if (unsubSnapshot) unsubSnapshot();
      }
    });
    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  // Diagnostic State
  const [diagIndex, setDiagIndex] = useState(0);
  const [diagScore, setDiagScore] = useState(0);

  // Auto skip to tree if already complete
  useEffect(() => {
    if (userProfile?.isDiagnosticComplete && (step === 'welcome' || step === 'diagnostic')) {
      setStep('tree');
    }
  }, [userProfile, step]);

  // Milestones / Badges logic
  const badges = useMemo(() => {
    const list = [];
    const currentPoints = userProfile?.points || points;
    const currentMastery = userProfile?.mastery || userMastery;
    const profileBadges = userProfile?.badges || [];

    if (currentPoints >= 100) list.push({ id: '100pts', name: '100 Club', icon: <Zap className="w-4 h-4" />, color: 'bg-amber-500', text: '१०० अंक प्राप्त' });
    if (currentMastery.length >= 1) list.push({ id: 'early', name: 'Early Bird', icon: <Star className="w-4 h-4" />, color: 'bg-blue-500', text: 'पहिलो सफलता' });
    if (streak >= 3) list.push({ id: 'streak', name: 'Habit Hero', icon: <Flame className="w-4 h-4" />, color: 'bg-rose-500', text: 'दैनिक सक्रियता' });
    if (currentMastery.length >= 3) list.push({ id: 'explorer', name: 'Explorer', icon: <Award className="w-4 h-4" />, color: 'bg-indigo-500', text: '३ विधा मास्टर' });
    
    // AI Content Creation Badges
    if (profileBadges.includes('pioneer')) list.push({ id: 'pioneer', name: 'Pioneer', icon: <Sparkles className="w-4 h-4" />, color: 'bg-fuchsia-500', text: 'पहिलो आविष्कारक' });
    if (userProfile?.generatedCount >= 3) list.push({ id: 'creator', name: 'Creator', icon: <Lightbulb className="w-4 h-4" />, color: 'bg-orange-500', text: 'कदम सर्जक' });

    return list;
  }, [points, userMastery, streak, userProfile]);

  const currentBite = selectedLevel?.bites[currentBiteIndex];

  const handleStart = () => {
    if (userProfile?.isDiagnosticComplete) {
      setStep('tree');
    } else {
      setStep('diagnostic');
      setDiagIndex(0);
      setDiagScore(0);
    }
  };

  const handleDiagAnswer = async (correctIndex: number, chosenIndex: number) => {
    const isActuallyCorrect = chosenIndex === correctIndex;
    const newScore = isActuallyCorrect ? diagScore + 1 : diagScore;
    
    if (diagIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
      setDiagScore(newScore);
      setDiagIndex(prev => prev + 1);
    } else {
      // Diagnostic complete!
      const finalScore = newScore;
      let initialMastery: string[] = [];
      let assignedLevelName = "आधारभूत"; // 0-1
      
      if (finalScore >= 2) {
        initialMastery.push('sets-1', 'arithmetic-1');
        assignedLevelName = "मध्यम";
      }
      if (finalScore >= 4) {
        initialMastery.push('algebra-1', 'mensuration-1');
        assignedLevelName = "दक्ष";
      }
      if (finalScore === 5) {
        initialMastery.push('geometry-1', 'trigonometry-1', 'coordinates-1', 'vectors-1');
      }
      
      setUserMastery(initialMastery);
      const newPoints = finalScore * 20;
      setPoints(newPoints);
      setStep('tree');

      // Sync to Firestore if user exists
      if (auth.currentUser) {
        setLoading(true);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const updateData: any = { 
          points: increment(newPoints),
          isDiagnosticComplete: true,
          assignedLevel: assignedLevelName
        };
        if (initialMastery.length > 0) {
          updateData.mastery = arrayUnion(...initialMastery);
        }
        await updateDoc(userRef, updateData).catch(e => console.error("Diagnostic Update Error:", e));
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 'diagnostic') setStep('welcome');
    else if (step === 'tree') setStep('welcome');
    else if (step === 'learning') setStep('tree');
    else if (step === 'mastery') setStep('tree');
  };

  const handleSelectLevel = async (topic: Topic, level: Level) => {
    // Check if level is unlocked
    const isUnlocked = level.levelNum === 1 || userMastery.includes(`${topic.id}-${level.levelNum - 1}`);
    if (!isUnlocked) return;

    setSelectedTopic(topic);
    setSelectedLevel(level);
    setCurrentBiteIndex(0);
    setActiveVideoIdx(0);
    setConsecutiveCorrect(0);
    setFailureCount(0);
    setAdaptivePrompt(null);
    setUnlockedNext(false);
    setIsCorrect(null);
    setShowHint(false);
    setStep('learning');
    setIsGenerated(false);

    // Check Firestore for shared content
    setLoading(true);
    const levelKey = `${topic.id}-${level.levelNum}`;
    const sharedRef = doc(db, 'shared_levels', levelKey);
    
    try {
      const sharedSnap = await getDoc(sharedRef);
      if (sharedSnap.exists()) {
        const data = sharedSnap.data();
        // Use shared level content
        setSelectedLevel({
          ...level,
          bites: data.bites,
          title: level.title
        });
      }
    } catch (error: any) {
      if (error.code !== 'permission-denied') {
        console.error("Fetch Shared Level Error:", error);
      }
    }
    setLoading(false);
  };

  const handleGenerateAI = async () => {
    if (!selectedTopic || !selectedLevel) return;
    setLoading(true);
    try {
      const bites = await generateLevelContent(selectedTopic.name, selectedLevel.levelNum);
      if (bites.length > 0) {
        setSelectedLevel({
          ...selectedLevel,
          bites: bites
        });
        setIsGenerated(true);
        setCurrentBiteIndex(0);
      }
    } catch (error) {
      console.error("Generate Error:", error);
    }
    setLoading(false);
  };

  const handleSaveToCommunity = async () => {
    if (!selectedTopic || !selectedLevel || !user) return;
    setLoading(true);
    try {
      const levelKey = `${selectedTopic.id}-${selectedLevel.levelNum}`;
      const sharedRef = doc(db, 'shared_levels', levelKey);
      
      // Check if document already exists to determine pioneer badge
      const sharedSnap = await getDoc(sharedRef);
      const isFirst = !sharedSnap.exists();

      await setDoc(sharedRef, {
        topicId: selectedTopic.id,
        levelNum: selectedLevel.levelNum,
        title: selectedLevel.title,
        bites: selectedLevel.bites,
        creatorId: user.uid,
        creatorName: user.displayName || 'Student',
        createdAt: serverTimestamp()
      });

      // Update User Profile
      const userRef = doc(db, 'users', user.uid);
      const updateData: any = { generatedCount: increment(1) };
      if (isFirst) {
        updateData.badges = arrayUnion('pioneer');
      }
      await updateDoc(userRef, updateData);

      setIsGenerated(false); // Hide save button after saving
      alert("पाठ समुदायमा सफलतापूर्वक सेभ गरियो!");
    } catch (error) {
      console.error("Save Error:", error);
    }
    setLoading(false);
  };

  const handleAnswer = async (optionIndex: number) => {
    if (!currentBite) return;
    if (optionIndex === currentBite.correctIndex) {
      setIsCorrect(true);
      setShowHint(false);
      setUnlockedNext(true);
      setConsecutiveCorrect(prev => prev + 1);
      setFailureCount(0);
      
      const reward = 10;
      setPoints(prev => prev + reward);

      // Adaptive Logic: Mastery Detection
      if (consecutiveCorrect + 1 >= 3 && currentBiteIndex < (selectedLevel?.bites.length || 0) - 1) {
        setAdaptivePrompt("Excellent work! You seem to have mastered this concept. You can skip directly to the next level or continue practicing.");
      } else {
        setAdaptivePrompt(null);
      }

      // Sync to Firestore
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          points: increment(reward)
        }).catch(e => console.error("Answer Points Update Error:", e));
      }
    } else {
      setIsCorrect(false);
      setShowHint(true);
      setConsecutiveCorrect(0);
      setFailureCount(prev => prev + 1);

      // Adaptive Logic: Intervention
      if (failureCount + 1 >= 2) {
        setAdaptivePrompt("Struggling with this one? Try reviewing the concept below or check out the reference video for a quick refresh!");
      }
    }
  };

  const handleSkipToMastery = async () => {
    if (!selectedTopic || !selectedLevel) return;
    
    // Record mastery
    const levelId = `${selectedTopic.id}-${selectedLevel.levelNum}`;
    if (!userMastery.includes(levelId)) {
      setUserMastery(prev => [...prev, levelId]);
      const bonus = 50;
      setPoints(prev => prev + bonus);

      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          points: increment(bonus),
          mastery: arrayUnion(levelId)
        }).catch(e => console.error("Skip Mastery Error:", e));
      }
    }
    setStep('mastery');
  };

  const handleNext = async () => {
    if (!selectedLevel) return;
    
    setFailureCount(0);
    setAdaptivePrompt(null);

    if (currentBiteIndex < selectedLevel.bites.length - 1) {
      setCurrentBiteIndex(prev => prev + 1);
      setUnlockedNext(false);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      // Level Mastered!
      const levelId = `${selectedTopic!.id}-${selectedLevel.levelNum}`;
      if (!userMastery.includes(levelId)) {
        setUserMastery([...userMastery, levelId]);
        const bonus = 50;
        setPoints(prev => prev + bonus);

        // Sync to Firestore
        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, {
            points: increment(bonus),
            mastery: arrayUnion(levelId)
          }).catch(e => console.error("Level Mastery Update Error:", e));
        }
      }
      setStep('mastery');
    }
  };

  // Analytics Helpers
  const redAlertList = useMemo(() => MOCK_STUDENTS.filter(s => s.struggleCount >= 3), []);
  const hiddenGaps = useMemo(() => MOCK_STUDENTS.filter(s => {
    if (s.grade >= 8 && s.currentPhase === "Phase 1") return true;
    if (s.grade >= 9 && s.currentPhase === "Phase 2") return true;
    return false;
  }), []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-6 h-6" />;
      case 'Variable': return <Variable className="w-6 h-6" />;
      case 'Triangle': return <Triangle className="w-6 h-6" />;
      case 'Layers': return <Layers className="w-6 h-6" />;
      case 'Box': return <Box className="w-6 h-6" />;
      case 'Spline': return <Spline className="w-6 h-6" />;
      case 'BarChart3': return <BarChart3 className="w-6 h-6" />;
      case 'Dice5': return <Dice5 className="w-6 h-6" />;
      case 'Target': return <Target className="w-6 h-6" />;
      case 'ArrowUpRight': return <ArrowUpRight className="w-6 h-6" />;
      default: return <Layers className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col selection:bg-blue-100 bg-[#F0F9FF]">
      {loading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full shadow-2xl shadow-blue-500/20"
          />
        </div>
      )}
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setStep('welcome')}>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200 font-bold group-hover:scale-110 transition-transform">
              ∑
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 text-shadow-sm">Smart Math Tutor</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                {view === 'student' ? 'Student Workspace' : 'Educational Data Analyst'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {!user ? (
              <button 
                onClick={signIn}
                className="bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm text-sm font-black text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" /> Login to Save Progress
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-6 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt="Avatar" /> : <Users className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Welcome,</span>
                    <span className="text-xs font-black text-slate-900 truncate max-w-[100px]">{user.displayName}</span>
                  </div>
                </div>
              </div>
            )}

            {view === 'student' && step !== 'welcome' && (
              <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 border-r border-slate-100 pr-4">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
                    <Flame className="w-4 h-4 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Streak</span>
                    <span className="text-xs font-black text-rose-600">{streak} Days</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">My XP</span>
                    <span className="text-xs font-black text-blue-600">{points} Points</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
              <button
                onClick={() => setView('student')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${view === 'student' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Users className="w-4 h-4" /> Student View
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${view === 'analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Analytics Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Back Button Navigation */}
        {view === 'student' && (step === 'tree' || step === 'learning') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex items-center">
            <button 
              onClick={handleBack}
              className="px-6 py-3 bg-white text-slate-800 rounded-2xl font-black text-sm hover:bg-slate-50 hover:shadow-md border-2 border-slate-200 flex items-center gap-3 transition-all group drop-shadow-sm"
            >
              <div className="bg-slate-100 text-slate-500 p-1.5 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
              </div>
              <span className="tracking-wide">पछाडि फर्कनुहोस् (Back)</span>
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {view === 'student' ? (
            <div className="flex-1 flex flex-col">
              {step === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col items-center justify-center text-center gap-8"
                >
                  <div className="bg-white p-12 rounded-[2.5rem] card-shadow border border-white max-w-2xl relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-40 animate-pulse" />
                    
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-inner">
                      <GraduationCap className="w-8 h-8" />
                    </div>

                    <h2 className="text-5xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                      नमस्ते! <span className="text-blue-600">सिकाईको यात्रा</span> सुरु गरौँ
                    </h2>
                    <p className="text-slate-600 text-lg mb-10 leading-relaxed max-w-lg mx-auto font-medium">
                      तपाईंको निजी 'Skill Tree' तयार छ। आफ्नो विषय रोज्नुहोस् र उपलब्ध उपलब्धिहरू हात पार्नुहोस्।
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={handleStart}
                        className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 active:scale-[0.98] group flex items-center justify-center gap-3"
                      >
                        Skill Tree हेर्नुहोस्
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'diagnostic' && (
                <motion.div
                  key="diagnostic"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col items-center justify-center gap-8"
                >
                  <div className="bg-white p-12 rounded-[2.5rem] card-shadow border border-white max-w-2xl w-full relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">निदान परीक्षा (Diagnostic Test)</h3>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        Question {diagIndex + 1} of 5
                      </span>
                    </div>

                    <div className="mb-10">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${((diagIndex) / 5) * 100}%` }}
                          className="h-full bg-indigo-600 shadow-lg"
                        />
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mb-8 leading-tight">
                      <Latex>{DIAGNOSTIC_QUESTIONS[diagIndex].task}</Latex>
                    </h2>

                    <div className="grid gap-4">
                      {DIAGNOSTIC_QUESTIONS[diagIndex].options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDiagAnswer(DIAGNOSTIC_QUESTIONS[diagIndex].correctIndex, idx)}
                          className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50 transition-all font-bold text-lg active:scale-[0.98]"
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <p className="mt-8 text-center text-slate-400 text-xs font-bold italic">
                      "नडराउनुहोस्, यसले तपाईंलाई सहि लेबलमा राख्न मद्दत गर्नेछ।"
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 'tree' && (
                <motion.div
                  key="tree"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-8 flex-1"
                >
                  {/* Personal Student Stats Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastered</div>
                        <div className="text-lg font-black text-slate-900">{userMastery.length} Levels</div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points</div>
                        <div className="text-lg font-black text-slate-900">{points} XP</div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Level</div>
                        <div className="text-lg font-black text-slate-900">{userProfile?.assignedLevel || 'निर्धारण हुँदै'}</div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</div>
                        <div className="text-lg font-black text-slate-900">{Math.round((userMastery.length / 10) * 100)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Milestones */}
                  <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-white">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-blue-600" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">उपलब्धिहरू (Badges)</h3>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        {badges.length} Unlocked
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-6">
                      {badges.length > 0 ? (
                        badges.map(badge => (
                          <div key={badge.id} className="flex flex-col items-center gap-3 group">
                            <div className={`w-16 h-16 ${badge.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative overflow-hidden`}>
                              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                              {badge.icon}
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-black text-slate-900 leading-none mb-1">{badge.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{badge.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="w-full py-8 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                          <Lock className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-xs font-black uppercase tracking-widest opacity-50">पहिलो लेभल पूरा गरी ब्याच जित्नुहोस्!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-12">
                    {[1, 2, 3, 4].map(phase => {
                      const phaseTopics = SKILL_TREE.filter(t => t.phase === phase);
                      if (phaseTopics.length === 0) return null;
                      
                      // Phase 1 is always unlocked. Other phases check if prior phase is mastered.
                      // Alternatively, just checking if *any* topic in the current phase has Level 1 unlocked logic:
                      // Wait, we defined initialMastery specifically unlocking levels. 
                      // For a phase to be accessible, let's just make it visually distinct and use standard unlocking.
                      const isPhaseUnlocked = phase === 1 || SKILL_TREE.filter(t => t.phase === phase - 1).every(t => userMastery.includes(`${t.id}-1`)) || userMastery.some(m => phaseTopics.some(pt => m.includes(pt.id)));

                      const phaseNames: Record<number, { title: string, subtitle: string }> = {
                        1: { title: "Phase 1: Foundation", subtitle: "आधारभूत सिकाइ" },
                        2: { title: "Phase 2: Core Concepts", subtitle: "मुख्य अवधारणाहरू" },
                        3: { title: "Phase 3: Spatial & Geometry", subtitle: "स्थानिक र ज्यामिति" },
                        4: { title: "Phase 4: Data & Insights", subtitle: "तथ्याङ्क र सम्भाव्यता" }
                      };

                      return (
                        <div key={`phase-${phase}`} className="flex flex-col gap-6">
                          <div className="flex items-center gap-4 pl-4 border-l-4 border-indigo-500">
                            <div>
                              <h2 className="text-xl font-black text-slate-800 tracking-tight">{phaseNames[phase].title}</h2>
                              <p className="text-sm font-bold text-slate-400">{phaseNames[phase].subtitle}</p>
                            </div>
                            {!isPhaseUnlocked && <Lock className="w-5 h-5 text-slate-300 ml-auto" />}
                          </div>
                          
                          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 content-start ${!isPhaseUnlocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            {phaseTopics.map((topic) => (
                              <div key={topic.id} className="bg-white p-8 rounded-[2.5rem] card-shadow border border-white relative overflow-hidden group">
                                <div className="flex items-center gap-4 mb-8">
                                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                    {getIcon(topic.icon)}
                                  </div>
                                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{topic.name}</h3>
                                </div>

                                <div className="space-y-4">
                                  {topic.levels.map((level) => {
                                    const isMastered = userMastery.includes(`${topic.id}-${level.levelNum}`);
                                    const isUnlocked = isPhaseUnlocked && (level.levelNum === 1 || userMastery.includes(`${topic.id}-${level.levelNum - 1}`));
                                    
                                    return (
                                      <button
                                        key={level.id}
                                        onClick={() => handleSelectLevel(topic, level)}
                                        disabled={!isUnlocked}
                                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all group/btn ${
                                          isMastered 
                                            ? 'border-emerald-100 bg-emerald-50 text-emerald-900' 
                                            : isUnlocked 
                                            ? 'border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50 text-slate-800' 
                                            : 'border-slate-50 bg-slate-50 opacity-40 cursor-not-allowed'
                                        }`}
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                                            isMastered ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                                          }`}>
                                            {isMastered ? <CheckCircle2 className="w-4 h-4" /> : level.levelNum}
                                          </div>
                                          <span className="font-bold text-sm text-left">{level.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {isMastered && <Medal className="w-5 h-5 text-amber-500 animate-bounce" />}
                                          {!isUnlocked ? <Lock className="w-4 h-4 text-slate-300" /> : <ChevronRight className="w-5 h-5 text-slate-300 group-hover/btn:translate-x-1 transition-transform" />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 'learning' && selectedLevel && currentBite && (
                <motion.div
                  key="learning"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1"
                >
                  <div className="md:col-span-5 flex flex-col gap-6">
                    <div className="bg-white p-8 rounded-[2rem] card-shadow border border-white flex-1 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Lightbulb className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.1em]">{selectedTopic?.name}</span>
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 mb-6 leading-tight drop-shadow-sm">{selectedLevel.title}</h3>
                      <div className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-8 rounded-[2rem] border-2 border-indigo-100/50 shadow-sm relative z-0">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none z-[-1]">
                          <Sparkles className="w-24 h-24" />
                        </div>
                        <div className="text-slate-700 text-xl leading-[1.8] font-medium font-sans prose prose-lg">
                          <Latex>{currentBite.concept}</Latex>
                        </div>
                      </div>
                      <div className="mt-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Level Progress</p>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentBiteIndex) / selectedLevel.bites.length) * 100}%` }}
                            className="h-full bg-blue-600 rounded-full shadow-lg"
                          />
                        </div>
                        <div className="flex justify-between mt-3 font-black text-[10px] text-slate-500">
                          <span className="bg-slate-100 px-2 py-1 rounded">BITE {currentBiteIndex + 1} OF {selectedLevel.bites.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-7 space-y-6">
                    <div className="bg-slate-900 p-8 lg:p-10 rounded-[2rem] shadow-2xl text-white relative h-full border-4 border-slate-800 flex flex-col">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-[2rem] pointer-events-none" />
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${unlockedNext ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/10 text-white border border-white/10'}`}>
                            {unlockedNext ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                          </div>
                          <h4 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Level {selectedLevel.levelNum} - Interactive Task</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {adaptivePrompt && consecutiveCorrect >= 3 && (
                            <button
                              onClick={handleSkipToMastery}
                              className="bg-amber-500 hover:bg-amber-400 text-white text-[11px] font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-600/30 active:scale-95 flex items-center gap-2 border border-amber-400/30 animate-pulse"
                            >
                              <FastForward className="w-4 h-4" /> Fast Track to Mastery
                            </button>
                          )}
                          {selectedLevel.bites.length <= 1 && (
                            <button
                              onClick={handleGenerateAI}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center gap-2 border border-indigo-400/30"
                            >
                              <Sparkles className="w-4 h-4" /> AI Generate FULL Level
                            </button>
                          )}
                          {isGenerated && user && (
                            <button
                              onClick={handleSaveToCommunity}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/30 active:scale-95 flex items-center gap-2 border border-emerald-400/30"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Save to Community
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 relative z-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl pointer-events-none" />
                        <div className="text-2xl md:text-3xl font-bold leading-relaxed text-slate-100 min-h-[4rem] relative z-10">
                          <Latex>{currentBite.task}</Latex>
                        </div>
                      </div>

                      {adaptivePrompt && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-5 rounded-2xl mb-8 border-2 flex items-start gap-4 ${
                            failureCount >= 2 
                              ? 'bg-rose-900/40 border-rose-500/30 text-rose-100' 
                              : 'bg-amber-900/40 border-amber-500/30 text-amber-100'
                          }`}
                        >
                          {failureCount >= 2 ? <BrainCircuit className="w-6 h-6 text-rose-400 shrink-0" /> : <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />}
                          <div>
                            <p className="font-bold text-sm md:text-base">{adaptivePrompt}</p>
                          </div>
                        </motion.div>
                      )}

                      <div className="grid gap-4 mt-auto relative z-10">
                        {currentBite.options.map((option, idx) => (
                          <button
                            key={idx}
                            disabled={unlockedNext}
                            onClick={() => handleAnswer(idx)}
                            className={`w-full text-left p-6 rounded-2xl border-2 transition-all font-bold text-xl flex items-center justify-between group overflow-hidden relative ${
                              unlockedNext && idx === currentBite.correctIndex 
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                                : isCorrect === false && idx === currentBite.correctIndex && showHint
                                ? 'border-white/20 text-white/50' 
                                : 'border-slate-700 bg-slate-800/50 hover:border-blue-400 hover:bg-blue-900/30 text-slate-300 hover:text-white'
                            }`}
                          >
                            <Latex>{option}</Latex>
                            {unlockedNext && idx === currentBite.correctIndex && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                          </button>
                        ))}
                      </div>
                      {unlockedNext && (
                        <motion.button
                          onClick={handleNext}
                          className="mt-10 w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20"
                        >
                          अर्को चरण <ArrowRight className="w-6 h-6" />
                        </motion.button>
                      )}
                      {showHint && (
                        <div className="mt-6 bg-blue-900/40 p-5 rounded-2xl border border-blue-500/30 flex items-start gap-4">
                          <MessageCircle className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                          <p className="text-blue-100 font-bold text-sm">एकपटक सोच्नुहोस् त... {currentBite.hint}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {VIDEO_REFERENCES[`${selectedTopic?.id}-${selectedLevel?.levelNum}`] && (
                    <div className="md:col-span-12 mt-4 bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 shadow-sm border border-rose-200/50">
                            <PlayCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 text-xl tracking-tight">Reference Videos</h4>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Learn with expert tutorials</p>
                          </div>
                        </div>
                        <div className="bg-white/50 px-4 py-2 rounded-xl border border-white text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {VIDEO_REFERENCES[`${selectedTopic?.id}-${selectedLevel?.levelNum}`].length} Videos Available
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                          <div className="rounded-[2rem] overflow-hidden bg-slate-900 aspect-video relative shadow-2xl border-8 border-white">
                            <iframe
                              className="absolute inset-0 w-full h-full"
                              src={VIDEO_REFERENCES[`${selectedTopic?.id}-${selectedLevel?.levelNum}`][activeVideoIdx]?.url}
                              title="Reference Video"
                              allowFullScreen
                            ></iframe>
                          </div>
                          <div className="mt-6 p-4 bg-white/40 rounded-2xl border border-white/60">
                            <h5 className="font-black text-slate-800 text-lg">
                              {VIDEO_REFERENCES[`${selectedTopic?.id}-${selectedLevel?.levelNum}`][activeVideoIdx]?.title}
                            </h5>
                          </div>
                        </div>

                        {VIDEO_REFERENCES[`${selectedTopic?.id}-${selectedLevel?.levelNum}`].length > 1 && (
                          <div className="lg:w-80 flex flex-col gap-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Video List</p>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {VIDEO_REFERENCES[`${selectedTopic?.id}-${selectedLevel?.levelNum}`].map((vid, vIdx) => (
                                <button
                                  key={vIdx}
                                  onClick={() => setActiveVideoIdx(vIdx)}
                                  className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center gap-4 group ${
                                    activeVideoIdx === vIdx 
                                      ? 'bg-white border-rose-500 shadow-lg shadow-rose-100 ring-4 ring-rose-50/50' 
                                      : 'bg-white/50 border-white hover:bg-white hover:border-slate-200'
                                  }`}
                                >
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                                    activeVideoIdx === vIdx ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-400'
                                  }`}>
                                    <PlayCircle className="w-5 h-5" />
                                  </div>
                                  <span className={`font-bold text-sm leading-snug ${
                                    activeVideoIdx === vIdx ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'
                                  }`}>
                                    {vid.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 'mastery' && selectedLevel && (
                <motion.div
                  key="mastery"
                  className="flex-1 flex flex-col items-center justify-center gap-8"
                >
                  <div className="bg-white p-12 rounded-[3rem] card-shadow border border-white w-full max-w-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Trophy className="w-48 h-48 text-blue-600" />
                    </div>
                    
                    <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-5xl mb-10 mx-auto shadow-2xl shadow-blue-200">
                      <Medal className="w-12 h-12" />
                    </div>
                    
                    <h2 className="text-4xl font-black text-slate-900 mb-4">{selectedTopic?.id === 'algebra' ? 'Beginner Algebra Master' : 'Subject Master!'}</h2>
                    <div className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest inline-block mb-8">
                      Level {selectedLevel.levelNum} Unlocked
                    </div>
                    
                    <p className="text-slate-600 text-xl font-medium mb-12 leading-relaxed">
                      तपाईंले <strong>{selectedLevel.title}</strong> सफलताका साथ पूरा गर्नुभयो। तपाईंको सिपको रूख (Skill Tree) मा नयाँ अध्याय थपिएको छ!
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button onClick={() => setStep('tree')} className="bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-sm">अर्को लेभलमा जानुहोस् (Skill Tree)</button>
                      <button onClick={() => { setStep('learning'); setCurrentBiteIndex(0); setUnlockedNext(false); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-black text-sm">पाठ पुन: पढ्नुहोस् (Retry)</button>
                      <button onClick={() => { handleGenerateAI(); }} className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4"/> थप अभ्यास (AI Generate)
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              <div className="md:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-white">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Skill Tree Mastery</h3>
                  </div>
                  <div className="text-5xl font-black text-blue-600 mb-2">{Math.round((userMastery.length / SKILL_TREE.reduce((acc, t) => acc + t.levels.length, 0)) * 100)}%</div>
                  <p className="text-slate-500 text-sm font-bold mb-8">Overall Tree Unlocked</p>
                  <div className="space-y-4">
                    {SKILL_TREE.map(t => (
                      <div key={t.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-slate-400 uppercase">{t.name}</span>
                          <span className="font-black text-slate-900">{t.levels.filter(l => userMastery.includes(`${t.id}-${l.levelNum}`)).length} / {t.levels.length}</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(t.levels.filter(l => userMastery.includes(`${t.id}-${l.levelNum}`)).length / t.levels.length) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-xl text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <Lightbulb className="w-5 h-5 text-indigo-300" />
                    <h3 className="text-sm font-black text-indigo-200 uppercase tracking-widest">शिक्षक सुझाव</h3>
                  </div>
                  <p className="text-lg font-bold leading-relaxed mb-6 italic">
                    "विद्यार्थीले Algebra Level 1 बिस्तारै तर सही रूपमा पूरा गरेका छन्। उनीहरूलाई खण्डीकरण (Factorization) सुरु गर्न प्रोत्साहन दिनुहोला।"
                  </p>
                </div>
              </div>

              <div className="md:col-span-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] card-shadow border border-white">
                    <div className="flex items-center gap-3 mb-6">
                      <Map className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Skill Migration</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 text-center bg-emerald-50 p-4 rounded-2xl">
                        <div className="text-2xl font-black text-emerald-700">Root</div>
                        <div className="text-[10px] text-emerald-500 uppercase font-black">Basics</div>
                      </div>
                      <ArrowRight className="text-slate-300" />
                      <div className="flex-1 text-center bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                        <div className="text-2xl font-black text-blue-700">L1</div>
                        <div className="text-[10px] text-blue-500 uppercase font-black">Concept</div>
                      </div>
                      <ArrowRight className="text-slate-300" />
                      <div className="flex-1 text-center bg-indigo-50 p-4 rounded-2xl">
                        <div className="text-2xl font-black text-indigo-700">L3</div>
                        <div className="text-[10px] text-indigo-500 uppercase font-black">Expert</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] card-shadow border border-white">
                    <div className="flex items-center gap-3 mb-6">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Struggle Alerts</h3>
                    </div>
                    <div className="space-y-3">
                      {redAlertList.slice(0, 2).map(s => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                          <span className="font-bold text-rose-900">{s.name}</span>
                          <span className="text-xs bg-rose-200 px-2 py-1 rounded font-black text-rose-700">L2 Calculus Gap</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-white">
                  <div className="flex items-center gap-3 mb-6">
                    <UserCheck className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Mastery Gaps</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hiddenGaps.slice(0, 2).map(s => (
                      <div key={s.id} className="p-5 bg-amber-50 rounded-3xl border border-amber-100 flex flex-col gap-2">
                        <div className="flex justify-between">
                          <span className="font-black text-amber-900">{s.name}</span>
                          <span className="text-[10px] font-black text-amber-600 bg-amber-200/50 px-2 py-1 rounded">GRADE {s.grade}</span>
                        </div>
                        <p className="text-xs font-bold text-amber-700 leading-relaxed italic">
                          "Algebra Level 1 Mastered! Next step: Simple Equations."
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-auto pt-10 pb-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
          <p>© 2024 Math Skill Tree - No Grades, Just Mastery.</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-600 rounded-full"></span> Mastery Path</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span> Unlocked</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-slate-200 rounded-full"></span> Locked</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
