"use client";

import { useEffect, useState } from "react";
import {
  CircleX,
  MessageCircleMore,
  MessageSquareReply,
  PencilLine,
  SendHorizontal,
  Trash2
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Magnetic } from "@/components/magnetic";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import type { DiscussionQuestion } from "@/types/api";

export default function DiscussionPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadQuestions() {
    setLoading(true);
    const { ok, payload } = await apiRequest<{ questions: DiscussionQuestion[] }>("/questions");
    if (ok) {
      setQuestions(payload.questions);
      setError("");
    } else {
      setError("Failed to load questions.");
    }
    setLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadQuestions();
    });
  }, []);

  async function askQuestion() {
    const endpoint = editingQuestionId ? `/questions/${editingQuestionId}` : "/questions";
    const method = editingQuestionId ? "PATCH" : "POST";
    const { ok, payload } = await apiRequest<{ message?: string }>(endpoint, {
      method,
      body: { title, body }
    });

    if (!ok) {
      setError(payload.message ?? "Failed to submit question.");
      return;
    }

    setTitle("");
    setBody("");
    setEditingQuestionId(null);
    setMessage(editingQuestionId ? "Question updated." : "Question posted.");
    await loadQuestions();
  }

  async function submitAnswer(questionId: string) {
    const value = answerText[questionId]?.trim();
    if (!value) {
      return;
    }

    const endpoint = editingAnswerId ? `/questions/answers/${editingAnswerId}` : `/questions/${questionId}/answers`;
    const method = editingAnswerId ? "PATCH" : "POST";
    const { ok, payload } = await apiRequest<{ message?: string }>(endpoint, {
      method,
      body: { body: value }
    });

    if (!ok) {
      setError(payload.message ?? "Failed to submit answer.");
      return;
    }

    setAnswerText((prev) => ({ ...prev, [questionId]: "" }));
    setEditingAnswerId(null);
    setMessage("Answer saved.");
    await loadQuestions();
  }

  async function deleteQuestion(questionId: string) {
    const { ok, payload } = await apiRequest<{ message?: string }>(`/questions/${questionId}`, {
      method: "DELETE"
    });
    if (!ok) {
      setError(payload.message ?? "Failed to delete question.");
      return;
    }
    await loadQuestions();
  }

  async function deleteAnswer(answerId: string) {
    const { ok, payload } = await apiRequest<{ message?: string }>(`/questions/answers/${answerId}`, {
      method: "DELETE"
    });
    if (!ok) {
      setError(payload.message ?? "Failed to delete answer.");
      return;
    }
    await loadQuestions();
  }

  return (
    <main className="flex w-full flex-col gap-5">
      <section className="page-intro">
        <span className="page-kicker">
          <MessageCircleMore className="h-3.5 w-3.5" />
          Discussion
        </span>
        <h1 className="text-3xl md:text-4xl">Ask for student perspective</h1>
        <p className="max-w-2xl text-[var(--ink-700)]">
          Keep the decision process social with moderated questions, grounded answers, and quick edits when plans change.
        </p>
      </section>
      <section className="split-layout">
        <Magnetic strength={12} rotate className="sticky-panel">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
                <MessageCircleMore className="h-4 w-4" />
                Community threads
              </div>
              <CardTitle>{editingQuestionId ? "Edit Question" : "Ask a Question"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Question title" />
              <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Describe your question..." />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--ink-700)]">
                  {user ? `Posting as ${user.name}` : "Login required for posting and moderation actions"}
                </p>
                <div className="flex gap-2">
                  {editingQuestionId ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingQuestionId(null);
                        setTitle("");
                        setBody("");
                      }}
                    >
                      <CircleX className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  ) : null}
                  <Button type="button" onClick={() => void askQuestion()}>
                    {editingQuestionId ? <PencilLine className="mr-2 h-4 w-4" /> : <SendHorizontal className="mr-2 h-4 w-4" />}
                    {editingQuestionId ? "Update Question" : "Post Question"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Magnetic>

        <div className="section-stack">

      {loading ? <LoadingState label="Loading questions..." /> : null}
      {!loading && error ? <ErrorState title={error} /> : null}
      {!loading && message ? <LoadingState label={message} /> : null}
      {!loading && !questions.length ? (
        <EmptyState title="No discussions yet." detail="Start the first thread about placements, courses, or campus decisions." />
      ) : null}

      {!loading
        ? questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{question.title}</CardTitle>
                    <p className="text-sm text-[var(--ink-700)]">Asked by {question.user.name}</p>
                  </div>
                  {user?.id === question.user.id ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingQuestionId(question.id);
                          setTitle(question.title);
                          setBody(question.body);
                        }}
                      >
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button type="button" variant="outline" onClick={() => void deleteQuestion(question.id)}>
                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{question.body}</p>
                <div className="space-y-3 rounded-lg border border-black/10 p-4">
                  <p className="font-medium">Answers</p>
                  {question.answers.length ? (
                    question.answers.map((answer) => (
                      <div key={answer.id} className="rounded-lg border border-black/10 p-3 text-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="flex items-start gap-2">
                              <MessageSquareReply className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                              <span>{answer.body}</span>
                            </p>
                            <p className="mt-1 text-xs text-[var(--ink-700)]">By {answer.user.name}</p>
                          </div>
                          {user?.id === answer.user.id ? (
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEditingAnswerId(answer.id);
                                  setAnswerText((prev) => ({ ...prev, [question.id]: answer.body }));
                                }}
                              >
                                <PencilLine className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => void deleteAnswer(answer.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                Delete
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--ink-700)]">No answers yet.</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 md:flex-row">
                  <Input
                    value={answerText[question.id] ?? ""}
                    onChange={(event) =>
                      setAnswerText((prev) => ({ ...prev, [question.id]: event.target.value }))
                    }
                    placeholder="Write an answer..."
                  />
                  <Button type="button" onClick={() => void submitAnswer(question.id)}>
                    <SendHorizontal className="mr-2 h-4 w-4" />
                    {editingAnswerId ? "Update Answer" : "Answer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        : null}
        </div>
      </section>
    </main>
  );
}
