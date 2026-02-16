import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        gap: 32,
      }}
    >
      <section style={{ textAlign: "center", maxWidth: 720 }}>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {["Étudiants", "Reconversion", "Sportifs", "Créateurs", "Entrepreneurs"].map(
            (label) => (
              <span
                key={label}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: 12,
                }}
              >
                {label}
              </span>
            )
          )}
        </div>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          Investis dans les{" "}
          <span style={{ color: "#38bdf8" }}>revenus futurs</span> des talents
          de demain.
        </h1>
        <p
          style={{
            fontSize: "15px",
            opacity: 0.8,
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          Xelior connecte des investisseurs à des étudiants, créateurs,
          sportifs, entrepreneurs et talents en reconversion en échange d&apos;un
          pourcentage de leurs revenus futurs.
        </p>
      </section>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <Link
          href="/talent/create"
          style={{
            padding: "14px 20px",
            borderRadius: 999,
            background:
              "linear-gradient(135deg, #38bdf8, #6366f1, #ec4899)",
            color: "white",
            textAlign: "center",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Je suis un talent – créer mon profil
        </Link>
        <Link
          href="/explore"
          style={{
            padding: "14px 20px",
            borderRadius: 999,
            backgroundColor: "transparent",
            border: "1px solid rgba(148,163,184,0.6)",
            color: "white",
            textAlign: "center",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Je suis investisseur – découvrir les talents
        </Link>
      </section>
    </main>
  );
}

