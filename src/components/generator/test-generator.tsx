"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TestGenerator() {
  const [subject, setSubject] = useState("Biology");
  const [topic, setTopic] = useState("Photosynthesis");
  const [style, setStyle] = useState<"Printable PDF" | "Google Sheets">("Google Sheets");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const canGenerate = useMemo(() => topic.trim().length > 2 && subject.trim().length > 1, [topic, subject]);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          topic: topic.trim(),
          style,
        }),
      });

      const data = (await response.json()) as { content?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate test.");
      }

      setGeneratedContent(data.content ?? "");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyForSheets = async () => {
    if (!generatedContent.trim()) return;
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handlePrintablePreview = () => {
    if (!generatedContent.trim()) return;
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${subject} - ${topic} Test</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; margin: 32px; color: #0f172a; }
            h1 { font-size: 22px; margin-bottom: 8px; }
            p { color: #475569; margin-bottom: 20px; }
            pre { white-space: pre-wrap; border: 1px solid #cbd5e1; background: #f8fafc; padding: 16px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>${subject}: ${topic}</h1>
          <p>Generated in Printable PDF mode.</p>
          <pre>${generatedContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Set subject, topic and output style for AI generation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject (e.g. Mathematics)"
          />
          <Input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Lesson topic (e.g. Quadratic Equations)"
          />
          <Select value={style} onValueChange={(value: "Printable PDF" | "Google Sheets") => setStyle(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose output style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Printable PDF">Printable PDF</SelectItem>
              <SelectItem value="Google Sheets">Google Sheets</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-fit"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? "Generating..." : "Generate Test with AI"}
          </Button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Test Preview</CardTitle>
          <CardDescription>
            {style === "Google Sheets"
              ? "Output should follow: Question | A | B | C | D | Correct Answer"
              : "Printable style output for direct classroom handouts"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!generatedContent ? (
            <p className="text-sm text-slate-500">
              Click &quot;Generate Test with AI&quot; to preview a generated test.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {style === "Google Sheets" ? (
                  <Button type="button" variant="outline" onClick={handleCopyForSheets}>
                    {copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied for Sheets" : "Copy for Google Sheets"}
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={handlePrintablePreview}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Printable Preview
                  </Button>
                )}
              </div>
              <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm whitespace-pre-wrap text-slate-800">
                {generatedContent}
              </pre>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
