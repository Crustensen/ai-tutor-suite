import Link from "next/link";
import { BarChart3, BrainCircuit, FileSpreadsheet } from "lucide-react";

import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16">
        <section className="space-y-6 text-center">
          <p className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700">
            Built for modern educators
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            AI Tutor Suite: From Lesson Planning to Performance Analytics
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            A unified workspace where teachers generate tests in seconds and track class performance with clear,
            actionable analytics.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/generator">Try AI Generator</Link>
            </Button>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <Card className="border-indigo-100 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <BrainCircuit className="h-5 w-5 text-indigo-600" />
                Generate tests in 10 seconds
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">
              Create lesson-specific assessments instantly with AI-powered drafting and ready answer keys for fast
              classroom use.
            </CardContent>
          </Card>
          <Card className="border-indigo-100 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Automatic performance analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">
              Upload student results and instantly get trends, weak-topic signals, and participation insights for
              targeted interventions.
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">Launch your teaching workflow in one place</h2>
              <p className="text-slate-600">
                Start from test generation, then move to analytics with the same clean interface.
              </p>
            </div>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/dashboard">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Go to Analytics
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
