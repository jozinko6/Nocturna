"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUp } from "@/app/actions/auth.actions";

const registerSchema = z
  .object({
    email: z.email("Neplatná emailová adresa"),
    displayName: z
      .string()
      .min(2, "Meno musí mať aspoň 2 znaky")
      .max(30, "Meno môže mať max. 30 znakov"),
    password: z
      .string()
      .min(8, "Heslo musí mať aspoň 8 znakov"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Heslá sa nezhodujú",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setSuccessMessage("");

    const result = registerSchema.safeParse({
      email,
      displayName,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await signUp(email, password, displayName);
      if (response.success) {
        if (response.data?.requiresEmailConfirmation) {
          setSuccessMessage(
            "Účet bol vytvorený. Potvrď e-mail cez odkaz, ktorý sme ti poslali, a potom sa prihlás."
          );
        } else {
          router.push("/onboarding");
        }
      } else {
        setServerError(response.error || "Nastala chyba.");
      }
    } catch {
      setServerError("Nastala neočakávaná chyba.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#e2e8f0] mb-1">Registrácia</h2>
      <p className="text-xs text-[#64748b] mb-5">
        Vytvor si účet a vstúp do temnoty
      </p>

      {serverError && (
        <div className="mb-4 p-3 rounded-sm bg-[#2a1215] border border-[#5c2a2e] text-xs text-[#fca5a5]">
          {serverError}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 rounded-sm bg-[#102419] border border-[#285c3d] text-xs text-[#86efac]">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="tvoj@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Zobrazovacie meno"
          placeholder="Tvoje meno vo svete"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
          required
        />
        <Input
          label="Heslo"
          type="password"
          placeholder="Aspoň 8 znakov"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        <Input
          label="Potvrdenie hesla"
          type="password"
          placeholder="Zopakuj heslo"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          Registrovať sa
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-[#64748b]">
        Už máš účet?{" "}
        <Link
          href="/login"
          className="text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          Prihlásiť sa
        </Link>
      </p>
    </div>
  );
}
