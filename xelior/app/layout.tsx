export const metadata = {
  title: "Xelior – Investir dans les talents",
  description:
    "Xelior permet d'investir dans les revenus futurs d'étudiants, créateurs, sportifs, entrepreneurs et talents en reconversion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: "#050816",
          color: "white",
        }}
      >
        {children}
      </body>
    </html>
  );
}

