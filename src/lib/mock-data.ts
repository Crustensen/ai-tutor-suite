export type ClassKpi = {
  label: string;
  value: string;
  helper: string;
};

export type ProgressPoint = {
  week: string;
  averageScore: number;
};

export type StudentResult = {
  id: number;
  name: string;
  topic: string;
  score: number;
  participation: number;
};

export const classKpis: ClassKpi[] = [
  {
    label: "Average Score",
    value: "82%",
    helper: "+4.5% from last assessment",
  },
  {
    label: "Most Problematic Topic",
    value: "Quadratic Equations",
    helper: "31% of students below benchmark",
  },
  {
    label: "Participation Rate",
    value: "91%",
    helper: "Stable high engagement this month",
  },
];

export const scoreTrend: ProgressPoint[] = [
  { week: "Week 1", averageScore: 68 },
  { week: "Week 2", averageScore: 72 },
  { week: "Week 3", averageScore: 75 },
  { week: "Week 4", averageScore: 78 },
  { week: "Week 5", averageScore: 81 },
  { week: "Week 6", averageScore: 82 },
];

export const studentResults: StudentResult[] = [
  { id: 1, name: "Emma Wilson", topic: "Fractions", score: 89, participation: 95 },
  { id: 2, name: "Liam Carter", topic: "Geometry", score: 77, participation: 88 },
  { id: 3, name: "Sophia Lee", topic: "Quadratic Equations", score: 64, participation: 79 },
  { id: 4, name: "Noah Patel", topic: "Algebra", score: 85, participation: 93 },
  { id: 5, name: "Olivia Brown", topic: "Quadratic Equations", score: 71, participation: 84 },
];

export const testTemplates = [
  {
    title: "Core Understanding",
    questions: [
      "Define the key concept in one clear sentence.",
      "Provide one real-world example related to the topic.",
      "Explain one common misconception and how to avoid it.",
    ],
    answerKey: [
      "Includes correct definition and core vocabulary.",
      "Example is relevant and logically connected to the concept.",
      "Misconception is accurate and corrected with a practical strategy.",
    ],
  },
  {
    title: "Applied Practice",
    questions: [
      "Solve the following scenario using the lesson method.",
      "Compare two different solution approaches.",
      "Write a short reflection on where students often struggle.",
    ],
    answerKey: [
      "All essential steps are shown in the right sequence.",
      "Comparison highlights efficiency and correctness trade-offs.",
      "Reflection names specific pain points and intervention ideas.",
    ],
  },
];
