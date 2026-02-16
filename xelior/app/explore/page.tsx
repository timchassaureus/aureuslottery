"use client";

import { useState } from "react";
import Link from "next/link";
import type { TalentCategory } from "@/lib/types";
import { mockTalents } from "@/lib/mockTalents";

const categoryLabels: Record<TalentCategory, string> = {
  student: "Étudiant(e)",
  reconversion: "Reconversion",
  athlete: "Sportif(ve)",
  creator: "Créateur(trice)",
  entrepreneur: "Entrepreneur(e)",
  freelancer: "Freelance",
  artist: "Artiste",
  healthcare: "Santé (formation)",
};

const categoryColors: Record<TalentCategory, string> = {
  student: "#38bdf8",
  reconversion: "#a855f7",
  athlete: "#f97316",
  creator: "#ec4899",
  entrepreneur: "#22c55e",
  freelancer: "#eab308",
  artist: "#facc15",
  healthcare: "#2dd4bf",
};

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState<TalentCategory | "all">(
    "all"
  );

  const filteredTalents =
    activeFilter === "all"
      ? mockTalents
      : mockTalents.filter((t) => t.category === activeFilter);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 12px 40px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 3vw, 2.2rem)",
            marginBottom: 6,
          }}
        >
          Découvre les talents Xelior
        </h1>
        <p style={{ fontSize: 14, opacity: 0.75 }}>
          Scroll, lis les histoires, et investis dans les revenus futurs des
          personnes en qui tu crois.
        </p>
      </header>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <FilterChip
          label="Tous"
          active={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
        />
        {(Object.keys(categoryLabels) as TalentCategory[]).map((cat) => (
          <FilterChip
            key={cat}
            label={categoryLabels[cat]}
            active={activeFilter === cat}
            onClick={() => setActiveFilter(cat)}
          />
        ))}
      </div>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {filteredTalents.map((talent) => (
          <article
            key={talent.id}
            style={{
              borderRadius: 18,
              padding: 16,
              background:
                "radial-gradient(circle at top left, rgba(56,189,248,0.2), transparent), rgba(15,23,42,0.95)",
              border: "1px solid rgba(148,163,184,0.5)",
              display: "grid",
              gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1.2fr)",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                  gap: 8,
                }}
              >
                <h2 style={{ fontSize: 17, margin: 0 }}>{talent.fullName}</h2>
                <span
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 999,
                    backgroundColor: "rgba(15,23,42,0.9)",
                    border: `1px solid ${categoryColors[talent.category]}`,
                    color: categoryColors[talent.category],
                    whiteSpace: "nowrap",
                  }}
                >
                  {categoryLabels[talent.category]}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                  marginBottom: 6,
                }}
              >
                {talent.headline}
              </p>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.7,
                  marginBottom: 8,
                }}
              >
                {talent.city && `${talent.city}, `} {talent.country}
              </p>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.75,
                  maxHeight: 80,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {talent.description}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <Metric
                  label="Montant demandé"
                  value={talent.amountRequested.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                />
                <Metric
                  label="% revenus cédés"
                  value={`${talent.incomeSharePercent}%`}
                />
                <Metric
                  label="Durée"
                  value={`${talent.durationYears} ans`}
                />
                <Metric label="Risque estimé" value="Moyen" />
              </div>

              <Link
                href={`/talent/${talent.id}`}
                style={{
                  width: "100%",
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #38bdf8, #6366f1, #ec4899)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: 4,
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                Voir le profil & simuler
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function FilterChip(props: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      style={{
        padding: "6px 11px",
        borderRadius: 999,
        border: props.active
          ? "1px solid #38bdf8"
          : "1px solid rgba(148,163,184,0.6)",
        backgroundColor: props.active
          ? "rgba(56,189,248,0.15)"
          : "rgba(15,23,42,0.9)",
        color: "white",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {props.label}
    </button>
  );
}

function Metric(props: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        backgroundColor: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(51,65,85,0.9)",
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>
        {props.label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{props.value}</div>
    </div>
  );
}

