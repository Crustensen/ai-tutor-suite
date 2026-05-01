import { SiteNav } from "@/components/site-nav";
import { TestGenerator } from "@/components/generator/test-generator";

export default function GeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Test Generator</h1>
          <p className="text-slate-600">
            Enter your lesson topic and instantly generate a mock test with questions and answer keys.
          </p>
        </section>
        <TestGenerator />
      </main>
    </div>
  );
}
