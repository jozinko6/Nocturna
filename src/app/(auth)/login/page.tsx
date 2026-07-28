"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vyplň všetky polia.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!signInError) {
        const requestedPath = new URLSearchParams(window.location.search).get("next");
        const destination =
          requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
            ? requestedPath
            : "/dashboard";
        window.location.assign(destination);
      } else {
        setError(signInError.message);
      }
    } catch {
      setError("Nastala neočakávaná chyba.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#e2e8f0] mb-1">Prihlásenie</h2>
      <p className="text-xs text-[#64748b] mb-5">
        Vráť sa do sveta Nocturna
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-sm bg-[#2a1215] border border-[#5c2a2e] text-xs text-[#fca5a5]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="tvoj@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Heslo"
          type="password"
          placeholder="Tvoje heslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          Prihlásiť sa
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-[#64748b]">
        Nemáš účet?{" "}
        <Link
          href="/register"
          className="text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          Registrovať sa
        </Link>
      </p>
    </div>
  );
}
