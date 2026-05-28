"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Magnetic } from "@/components/magnetic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validateRegisterForm() {
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters.";
    }
    if (!email.includes("@")) {
      return "Please enter a valid email address.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return "Password must include a letter, a number, and a special character.";
    }
    return "";
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    if (mode === "register") {
      const validationMessage = validateRegisterForm();
      if (validationMessage) {
        setSubmitting(false);
        setMessage(validationMessage);
        return;
      }
    }

    const result =
      mode === "login"
        ? await login(email, password)
        : await register(name, email, password);

    setSubmitting(false);
    if (!result.ok) {
      setMessage(result.message ?? "Authentication failed.");
      return;
    }

    router.push("/");
  }

  return (
    <main className="flex w-full justify-center">
      <div className="flex w-full max-w-5xl flex-col gap-6 md:flex-row md:items-start">
        <section className="page-intro max-w-xl">
          <span className="page-kicker">
            <Mail className="h-3.5 w-3.5" />
            Account
          </span>
          <h1 className="text-3xl md:text-4xl">
            Save your college research, comparisons, and discussion history
          </h1>
          <p className="text-[var(--ink-700)]">
            Use email and password to keep your shortlist, prediction flow, and saved boards attached to one account.
          </p>
        </section>
        <Magnetic strength={12} rotate>
          <Card className="w-full max-w-md overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
                <Mail className="h-4 w-4" />
                Email and password access
              </div>
              <CardTitle>{mode === "login" ? "Login" : "Create Account"}</CardTitle>
              <p className="text-sm text-[var(--ink-700)]">
                {mode === "login"
                  ? "Resume your saved comparisons, questions, and shortlisted colleges."
                  : "Create an account to save your decision flow across compare, predictor, and discussion."}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/[0.04] p-1">
                <button
                  type="button"
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    mode === "login" ? "bg-[var(--surface)] shadow-sm" : "text-[var(--ink-700)]"
                  }`}
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    mode === "register" ? "bg-[var(--surface)] shadow-sm" : "text-[var(--ink-700)]"
                  }`}
                  onClick={() => {
                    setMode("register");
                    setMessage("");
                  }}
                >
                  Register
                </button>
              </div>
              <form onSubmit={onSubmit} className="space-y-3">
                {mode === "register" ? (
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Full name"
                    required
                  />
                ) : null}
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  required
                />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  required
                />
                {mode === "register" ? (
                  <p className="text-xs text-[var(--ink-600)]">
                    Use at least 8 characters with a letter, a number, and a special character.
                  </p>
                ) : null}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {mode === "login" ? (
                    <LockKeyhole className="mr-2 h-4 w-4" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  {submitting
                    ? "Please wait..."
                    : mode === "login"
                      ? "Login with Email"
                      : "Register with Email"}
                </Button>
              </form>

              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-[var(--ink-700)]"
                onClick={() => {
                  setMode((prev) => (prev === "login" ? "register" : "login"));
                  setMessage("");
                }}
              >
                {mode === "login"
                  ? "Need an account? Register"
                  : "Already have an account? Login"}
                <ArrowRight className="h-4 w-4" />
              </button>
              {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
            </CardContent>
          </Card>
        </Magnetic>
      </div>
    </main>
  );
}
