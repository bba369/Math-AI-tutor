export interface Bite {
  id: number;
  concept: string;
  task: string;
  hint: string;
  options: string[];
  correctIndex: number;
}

export interface Level {
  id: number;
  levelNum: 1 | 2 | 3;
  title: string;
  bites: Bite[];
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  phase: number;
  levels: Level[];
}

export interface UserProgress {
  topicId: string;
  levelNum: number;
  biteIndex: number;
  isUnlocked: boolean;
  masteryBadge: string | null;
}

export interface StudentPerformance {
  id: string;
  name: string;
  currentPhase: string;
  currentLevel: number;
  grade: number;
  struggleCount: number;
  lastActive: string;
  topicMastery: { [key: string]: number };
}

export interface AnalyticsReport {
  masteryRate: number;
  totalStudents: number;
  phaseDistribution: { [key: string]: number };
  strugglePoints: string[];
  redAlertList: StudentPerformance[];
  hiddenGaps: { studentName: string; gap: string }[];
}

export const MOCK_STUDENTS: StudentPerformance[] = [
  {
    id: "1",
    name: "राम बहादुर",
    currentPhase: "Phase 1",
    currentLevel: 2,
    grade: 8,
    struggleCount: 4,
    lastActive: "२०८२/१२/१०",
    topicMastery: { "समूह": 40, "अङ्कगणित": 30 }
  },
  {
    id: "2",
    name: "सिता कुमारी",
    currentPhase: "Phase 3",
    currentLevel: 5,
    grade: 9,
    struggleCount: 0,
    lastActive: "२०८२/१२/११",
    topicMastery: { "समूह": 95, "अङ्कगणित": 90 }
  },
  {
    id: "3",
    name: "हरि प्रसाद",
    currentPhase: "Phase 2",
    currentLevel: 3,
    grade: 9,
    struggleCount: 5,
    lastActive: "२०८२/१२/०९",
    topicMastery: { "समूह": 60, "अङ्कगणित": 45 }
  },
  {
    id: "4",
    name: "निर्मला राई",
    currentPhase: "Phase 1",
    currentLevel: 1,
    grade: 6,
    struggleCount: 1,
    lastActive: "२०८२/१२/११",
    topicMastery: { "समूह": 20, "अङ्कगणित": 15 }
  }
];
