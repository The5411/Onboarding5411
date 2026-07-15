import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft, GraduationCap } from "lucide-react";
import { QUIZZES } from "@/data/quizzes";

export const Route = createFileRoute("/simulacro/$stage")({
  head: ({ params }) => ({
    meta: [{ title: `Simulacro — ${QUIZZES[params.stage]?.title ?? "Onboarding 5411"}` }],
  }),
  component: SimulacroPage,
});

function SimulacroPage() {
  const { stage } = Route.useParams();
  const quiz = QUIZZES[stage];

  if (!quiz) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold">Simulacro no encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No existe un simulacro para "{stage}".
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la guía
        </Link>
      </div>
    );
  }

  return <Quiz quiz={quiz} />;
}

function Quiz({ quiz }: { quiz: (typeof QUIZZES)[string] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;

  const score = useMemo(() => {
    if (!submitted) return 0;
    return quiz.questions.reduce(
      (acc, q, i) => (answers[i] === q.correctIndex ? acc + 1 : acc),
      0,
    );
  }, [submitted, answers, quiz.questions]);

  const handleSelect = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${submitted ? 100 : pct}%`,
            background: `var(${quiz.phaseVar})`,
          }}
        />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la guía
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
            style={{
              background: `linear-gradient(135deg, var(${quiz.phaseVar}), oklch(from var(${quiz.phaseVar}) calc(l - 0.12) c h))`,
            }}
          >
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          </div>
        </div>

        {submitted && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center shadow-[var(--shadow-soft)]">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Resultado
            </div>
            <div className="mt-2 text-4xl font-bold">
              {score} / {total}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {score === total
                ? "¡Perfecto! Te sabés el proceso al derecho y al revés."
                : score / total >= 0.7
                  ? "¡Muy bien! Repasá las que fallaste para reforzar."
                  : "Repasá la guía y volvé a intentarlo."}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
              style={{ background: `var(${quiz.phaseVar})` }}
            >
              <RotateCcw className="h-4 w-4" /> Volver a intentar
            </button>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {quiz.questions.map((q, qIndex) => {
            const selected = answers[qIndex];
            return (
              <div
                key={qIndex}
                className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] md:p-6"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Pregunta {qIndex + 1} de {total}
                </div>
                <p className="mt-2 text-base font-semibold leading-relaxed">{q.question}</p>

                <div className="mt-4 space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selected === optIndex;
                    const isCorrect = optIndex === q.correctIndex;

                    let stateClasses = "border-border bg-background hover:bg-secondary/40";
                    if (submitted) {
                      if (isCorrect) {
                        stateClasses = "border-green-500/60 bg-green-500/10";
                      } else if (isSelected && !isCorrect) {
                        stateClasses = "border-destructive/60 bg-destructive/10";
                      }
                    } else if (isSelected) {
                      stateClasses = "border-primary bg-secondary/60";
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        disabled={submitted}
                        onClick={() => handleSelect(qIndex, optIndex)}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${stateClasses} ${
                          submitted ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        <span>{opt}</span>
                        {submitted && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                        )}
                        {submitted && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div className="mt-4 rounded-lg bg-secondary/40 p-3 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Explicación: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!submitted && (
          <div className="sticky bottom-6 mt-8 flex justify-center">
            <button
              type="button"
              disabled={answeredCount < total}
              onClick={() => {
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-lg px-8 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: `var(${quiz.phaseVar})` }}
            >
              {answeredCount < total
                ? `Respondé todas las preguntas (${answeredCount}/${total})`
                : "Ver resultado"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
