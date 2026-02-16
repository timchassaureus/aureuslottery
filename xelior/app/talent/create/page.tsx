"use client";

import { useState } from "react";
import type { TalentCategory } from "@/lib/types";

const categories: { id: TalentCategory; label: string }[] = [
  { id: "student", label: "Étudiant(e)" },
  { id: "reconversion", label: "Reconversion" },
  { id: "athlete", label: "Sportif(ve)" },
  { id: "creator", label: "Créateur(trice) de contenu" },
  { id: "entrepreneur", label: "Entrepreneur(e)" },
  { id: "freelancer", label: "Freelance / Indépendant" },
  { id: "artist", label: "Artiste" },
  { id: "healthcare", label: "Santé (en formation)" },
];

export default function CreateTalentPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<TalentCategory>("student");
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [country, setCountry] = useState("France");
  const [city, setCity] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [amountRequested, setAmountRequested] = useState(10000);
  const [incomeSharePercent, setIncomeSharePercent] = useState(5);
  const [durationYears, setDurationYears] = useState(5);
  const [description, setDescription] = useState("");

  const canGoNext =
    (step === 1 && !!fullName && !!headline) ||
    (step === 2 && amountRequested > 0 && incomeSharePercent > 0) ||
    (step === 3 && description.length > 40);

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    const payload = {
      category,
      fullName,
      headline,
      country,
      city,
      videoUrl,
      amountRequested,
      incomeSharePercent,
      durationYears,
      description,
    };
    // À brancher plus tard sur une API / base de données
    console.log("Talent submission:", payload);
    alert("Profil talent créé (simulation). On branchera l'enregistrement ensuite.");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 40px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, opacity: 0.6 }}>Étape {step} / 3</p>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 3vw, 2.2rem)",
            marginTop: 4,
            marginBottom: 8,
          }}
        >
          Crée ton profil de talent
        </h1>
        <p style={{ fontSize: 14, opacity: 0.75 }}>
          Cela prendra moins de 5 minutes. Tu pourras toujours modifier plus
          tard.
        </p>
      </header>

      <div
        style={{
          marginBottom: 24,
          height: 4,
          borderRadius: 999,
          background: "rgba(148,163,184,0.25)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(step / 3) * 100}%`,
            background:
              "linear-gradient(90deg, #38bdf8, #6366f1, #ec4899)",
            transition: "width 0.2s ease-out",
          }}
        />
      </div>

      {step === 1 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 6,
                opacity: 0.8,
              }}
            >
              Tu es…
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 8,
              }}
            >
              {categories.map((c) => {
                const selected = c.id === category;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    style={{
                      padding: "10px 10px",
                      borderRadius: 12,
                      border: selected
                        ? "1px solid #38bdf8"
                        : "1px solid rgba(148,163,184,0.4)",
                      backgroundColor: selected
                        ? "rgba(56,189,248,0.12)"
                        : "rgba(15,23,42,0.8)",
                      color: "white",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 6,
                opacity: 0.8,
              }}
            >
              Nom complet
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Prénom Nom"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.5)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 6,
                opacity: 0.8,
              }}
            >
              Phrase d&apos;accroche
            </label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Ex : Étudiant en médecine visant la chirurgie cardiaque"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.5)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: 14,
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 10,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  marginBottom: 6,
                  opacity: 0.8,
                }}
              >
                Pays
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.5)",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  marginBottom: 6,
                  opacity: 0.8,
                }}
              >
                Ville (optionnel)
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.5)",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 6,
                opacity: 0.8,
              }}
            >
              Lien vidéo de présentation (YouTube, Loom, etc.)
            </label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.5)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: 14,
              }}
            />
            <p style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
              60–90 secondes, filmé simplement avec ton téléphone, suffit.
            </p>
          </div>
        </section>
      )}

      {step === 2 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 6,
                opacity: 0.8,
              }}
            >
              Combien veux-tu lever ? (en €)
            </label>
            <input
              type="number"
              value={amountRequested}
              onChange={(e) =>
                setAmountRequested(Number(e.target.value || 0))
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.5)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: 14,
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 10,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  marginBottom: 6,
                  opacity: 0.8,
                }}
              >
                Pourcentage de revenus cédé (%)
              </label>
              <input
                type="number"
                value={incomeSharePercent}
                onChange={(e) =>
                  setIncomeSharePercent(Number(e.target.value || 0))
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.5)",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  marginBottom: 6,
                  opacity: 0.8,
                }}
              >
                Durée de l&apos;engagement (années)
              </label>
              <input
                type="number"
                value={durationYears}
                onChange={(e) =>
                  setDurationYears(Number(e.target.value || 0))
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.5)",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.4)",
              background:
                "radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent), rgba(15,23,42,0.9)",
              fontSize: 13,
            }}
          >
            <p style={{ marginBottom: 4, opacity: 0.9 }}>
              Exemple simplifié :
            </p>
            <p style={{ opacity: 0.75 }}>
              Si tu lèves{" "}
              <strong>
                {amountRequested.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </strong>{" "}
              en cédant <strong>{incomeSharePercent}%</strong> de tes revenus
              pendant <strong>{durationYears} ans</strong>, les investisseurs
              seront payés en fonction de ce que tu gagnes réellement chaque
              année.
            </p>
          </div>
        </section>
      )}

      {step === 3 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 6,
                opacity: 0.8,
              }}
            >
              Raconte ton histoire et ton projet
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
              placeholder="Qui es-tu, quel est ton parcours, ton projet, et pourquoi tu demandes ce financement ?"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.5)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: 14,
                resize: "vertical",
              }}
            />
            <p style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
              Minimum recommandé : 40–60 mots. Sois sincère, concret, et parle
              de ton futur.
            </p>
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.4)",
              backgroundColor: "rgba(15,23,42,0.9)",
              fontSize: 12,
              opacity: 0.8,
            }}
          >
            En cliquant sur &quot;Créer mon profil&quot;, tu confirmes que les
            informations fournies sont sincères. Plus tard, un contrat légal
            détaillera précisément ton engagement envers les investisseurs.
          </div>
        </section>
      )}

      <footer
        style={{
          marginTop: 32,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={step === 1}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.5)",
            backgroundColor: "transparent",
            color: step === 1 ? "rgba(148,163,184,0.5)" : "white",
            fontSize: 14,
            cursor: step === 1 ? "default" : "pointer",
          }}
        >
          Retour
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            style={{
              flex: 1.5,
              padding: "10px 14px",
              borderRadius: 999,
              border: "none",
              background: canGoNext
                ? "linear-gradient(135deg, #38bdf8, #6366f1, #ec4899)"
                : "rgba(51,65,85,0.9)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: canGoNext ? "pointer" : "default",
              opacity: canGoNext ? 1 : 0.6,
            }}
          >
            Continuer
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canGoNext}
            style={{
              flex: 1.5,
              padding: "10px 14px",
              borderRadius: 999,
              border: "none",
              background: canGoNext
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "rgba(51,65,85,0.9)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: canGoNext ? "pointer" : "default",
              opacity: canGoNext ? 1 : 0.6,
            }}
          >
            Créer mon profil
          </button>
        )}
      </footer>
    </main>
  );
}

