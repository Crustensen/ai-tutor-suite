"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, FolderKanban, Lightbulb, Loader2, Save, Trophy, Upload } from "lucide-react";

import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type StudentScore = {
  surname: string;
  answers: string[];
  correct: number;
  total: number;
  successRate: number;
};

type SavedAnalysis = {
  id: string;
  className: string;
  testDate: string;
  answerKeyText: string;
  studentInput: string;
  insights: string;
  savedAt: string;
};

const defaultAnswerKey = "1 | B\n2 | C\n3 | A\n4 | D";
const defaultStudentInput = "Ivanov | B,C,A,D\nPetrova | B,C,B,D\nSmirnov | A,C,A,D\nSidorov | B,D,A,C";
const LOCAL_STORAGE_KEY = "ai-tutor-suite.class-analyses.v1";

function parseAnswerKey(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      return (parts[1] ?? "").toUpperCase();
    })
    .filter(Boolean);
}

function parseStudentRows(raw: string): Array<{ surname: string; answers: string[] }> {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [surname, answersRaw] = line.split("|").map((part) => part.trim());
      const answers = (answersRaw ?? "")
        .split(/[,\s]+/)
        .map((answer) => answer.trim().toUpperCase())
        .filter(Boolean);
      return { surname: surname ?? "Unknown", answers };
    })
    .filter((row) => row.surname && row.answers.length > 0);
}

export function IntelligentDashboard() {
  const [className, setClassName] = useState("Grade 10A");
  const [testDate, setTestDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [answerKeyText, setAnswerKeyText] = useState(defaultAnswerKey);
  const [studentInput, setStudentInput] = useState(defaultStudentInput);
  const [insights, setInsights] = useState("");
  const [insightsError, setInsightsError] = useState("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>("new-analysis");

  useEffect(() => {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SavedAnalysis[];
      setSavedAnalyses(parsed);
    } catch {
      setSavedAnalyses([]);
    }
  }, []);

  const persistAnalyses = (items: SavedAnalysis[]) => {
    setSavedAnalyses(items);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  };

  const answerKey = useMemo(() => parseAnswerKey(answerKeyText), [answerKeyText]);

  const studentScores = useMemo<StudentScore[]>(() => {
    const rows = parseStudentRows(studentInput);
    const total = answerKey.length;

    return rows.map((row) => {
      let correct = 0;
      answerKey.forEach((rightAnswer, index) => {
        if (row.answers[index] === rightAnswer) correct += 1;
      });
      const successRate = total > 0 ? (correct / total) * 100 : 0;
      return {
        surname: row.surname,
        answers: row.answers,
        correct,
        total,
        successRate,
      };
    });
  }, [studentInput, answerKey]);

  const averageScore = useMemo(() => {
    if (!studentScores.length) return 0;
    const sum = studentScores.reduce((acc, student) => acc + student.successRate, 0);
    return sum / studentScores.length;
  }, [studentScores]);

  const participationRate = useMemo(() => {
    const participants = parseStudentRows(studentInput).length;
    return participants > 0 ? 100 : 0;
  }, [studentInput]);

  const weakTopics = useMemo(() => {
    if (!answerKey.length || !studentScores.length) return [];
    const stats = answerKey.map((_, index) => {
      let correct = 0;
      studentScores.forEach((student) => {
        if (student.answers[index] === answerKey[index]) correct += 1;
      });
      const rate = (correct / studentScores.length) * 100;
      return { label: `Q${index + 1}`, rate };
    });
    return stats.sort((a, b) => a.rate - b.rate);
  }, [answerKey, studentScores]);

  const chartData = useMemo(
    () =>
      studentScores.map((student, index) => ({
        label: `${index + 1}. ${student.surname}`,
        successRate: student.successRate,
      })),
    [studentScores]
  );

  const summaryTable = useMemo(() => {
    const header = "Surname | Correct | Total | Success %";
    const rows = studentScores.map(
      (student) => `${student.surname} | ${student.correct} | ${student.total} | ${student.successRate.toFixed(1)}`
    );
    const weak = weakTopics.map((item) => `${item.label}: ${item.rate.toFixed(1)}%`).join(", ");
    return [header, ...rows, `Weak Topics: ${weak || "n/a"}`].join("\n");
  }, [studentScores, weakTopics]);

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    setInsightsError("");

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryTable }),
      });
      const data = (await response.json()) as { content?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Failed to generate insights.");
      setInsights(data.content ?? "");
    } catch (error) {
      setInsightsError(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const saveCurrentAnalysis = () => {
    if (!className.trim() || !testDate) {
      setSaveMessage("Class name and test date are required.");
      return;
    }

    const analysis: SavedAnalysis = {
      id: crypto.randomUUID(),
      className: className.trim(),
      testDate,
      answerKeyText,
      studentInput,
      insights,
      savedAt: new Date().toISOString(),
    };

    const next = [analysis, ...savedAnalyses].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    persistAnalyses(next);
    setSelectedAnalysisId(analysis.id);
    setSaveMessage("Analysis saved to class folder.");
    setTimeout(() => setSaveMessage(""), 1800);
  };

  const loadSavedAnalysis = (id: string) => {
    setSelectedAnalysisId(id);
    if (id === "new-analysis") return;
    const record = savedAnalyses.find((item) => item.id === id);
    if (!record) return;
    setClassName(record.className);
    setTestDate(record.testDate);
    setAnswerKeyText(record.answerKeyText);
    setStudentInput(record.studentInput);
    setInsights(record.insights);
    setInsightsError("");
  };

  const classFolderEntries = useMemo(
    () =>
      savedAnalyses.filter(
        (analysis) => analysis.className.toLowerCase().trim() === className.toLowerCase().trim()
      ),
    [savedAnalyses, className]
  );

  const mostProblematicTopic = weakTopics[0]?.label ? `${weakTopics[0].label} (${weakTopics[0].rate.toFixed(0)}%)` : "n/a";

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{averageScore.toFixed(1)}%</p>
            <p className="text-xs text-slate-500">Calculated from parsed student answers</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Most Problematic Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{mostProblematicTopic}</p>
            <p className="text-xs text-slate-500">Lowest correct-answer ratio</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Participation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{participationRate.toFixed(0)}%</p>
            <p className="text-xs text-slate-500">Detected from pasted rows</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Dynamic Student Success Trend</CardTitle>
            <CardDescription>Recharts is driven by parsed live results.</CardDescription>
          </CardHeader>
          <CardContent>{chartData.length ? <PerformanceChart data={chartData} /> : <p>No data yet.</p>}</CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Test Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Class Folder</p>
                <Input value={className} onChange={(event) => setClassName(event.target.value)} placeholder="Grade 10A" />
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Test Date
                </p>
                <Input type="date" value={testDate} onChange={(event) => setTestDate(event.target.value)} />
              </div>
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Upload className="mr-2 h-4 w-4" />
              Upload Student Results (CSV/JSON)
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={saveCurrentAnalysis}>
              <Save className="mr-2 h-4 w-4" />
              Save Analysis to Class Folder
            </Button>
            {saveMessage ? <p className="text-sm text-emerald-700">{saveMessage}</p> : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Answer Key</CardTitle>
            <CardDescription>Format: Question number | Correct answer</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={answerKeyText}
              onChange={(event) => setAnswerKeyText(event.target.value)}
              className="min-h-[170px]"
              placeholder="1 | A"
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Student Data Paste</CardTitle>
            <CardDescription>Format: Surname | Answers (A,B,C,D)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={studentInput}
              onChange={(event) => setStudentInput(event.target.value)}
              className="min-h-[170px]"
              placeholder="Ivanov | A,B,C,D"
            />
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FolderKanban className="h-5 w-5 text-indigo-600" />
            Class Folder History
          </CardTitle>
          <CardDescription>Store and reopen test analyses by class and date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedAnalysisId} onValueChange={loadSavedAnalysis}>
            <SelectTrigger>
              <SelectValue placeholder="Select a saved analysis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new-analysis">Current unsaved analysis</SelectItem>
              {classFolderEntries.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.testDate} - {entry.className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {classFolderEntries.length === 0 ? (
            <p className="text-sm text-slate-500">No saved analyses for this class yet.</p>
          ) : (
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-700">Saved tests in this class folder:</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {classFolderEntries.slice(0, 6).map((entry) => (
                  <li key={entry.id}>
                    {entry.testDate} - saved {new Date(entry.savedAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Parsed Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Correct</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Success</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentScores.map((student) => (
                <TableRow key={student.surname}>
                  <TableCell className="font-medium">{student.surname}</TableCell>
                  <TableCell>{student.correct}</TableCell>
                  <TableCell>{student.total}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                      {student.successRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">AI Insights</CardTitle>
          <CardDescription>Massive Errors, Weak Topics, Top Performers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={fetchInsights} disabled={isLoadingInsights} className="bg-indigo-600 hover:bg-indigo-700">
            {isLoadingInsights ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Generate AI Insights
              </>
            )}
          </Button>
          {insightsError ? (
            <p className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              {insightsError}
            </p>
          ) : null}
          {insights ? (
            <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
              {insights}
            </pre>
          ) : (
            <p className="text-sm text-slate-500">
              Click the button to analyze massive errors, weak topics and top performers.
            </p>
          )}
          {weakTopics.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Trophy className="h-4 w-4 text-indigo-600" />
                Weak Topics Snapshot
              </p>
              <div className="flex flex-wrap gap-2">
                {weakTopics.slice(0, 3).map((item) => (
                  <Badge key={item.label} variant="secondary" className="bg-slate-100 text-slate-700">
                    {item.label}: {item.rate.toFixed(1)}%
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
