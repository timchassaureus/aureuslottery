import type { Talent } from "./types";

export const mockTalents: Talent[] = [
  {
    id: "1",
    fullName: "Lina M.",
    headline: "Étudiante en médecine, future chirurgienne cardiaque",
    category: "student",
    country: "France",
    city: "Lyon",
    videoUrl: "",
    amountRequested: 30000,
    incomeSharePercent: 6,
    durationYears: 8,
    description:
      "Je suis en 3e année de médecine et je vise une spécialisation en chirurgie cardiaque. Mes études et stages demandent un temps plein, ce qui limite ma capacité à travailler à côté. Je souhaite lever des fonds pour financer les prochaines années et me concentrer à 100 % sur ma formation.",
  },
  {
    id: "2",
    fullName: "Yanis B.",
    headline: "Créateur de contenu finance et business sur TikTok & YouTube",
    category: "creator",
    country: "France",
    city: "Paris",
    videoUrl: "",
    amountRequested: 20000,
    incomeSharePercent: 5,
    durationYears: 5,
    description:
      "Je crée du contenu autour de la finance personnelle et de l'entrepreneuriat. Avec plus de 150k abonnés cumulés, je veux professionnaliser mon contenu, monter une équipe et lancer des formats plus ambitieux.",
  },
  {
    id: "3",
    fullName: "Inès D.",
    headline: "Reconversion : dev web après 7 ans dans le retail",
    category: "reconversion",
    country: "Belgique",
    city: "Bruxelles",
    videoUrl: "",
    amountRequested: 12000,
    incomeSharePercent: 4,
    durationYears: 4,
    description:
      "Après 7 ans comme manager dans le retail, je me reconvertis en développeuse web. Je suis acceptée dans une formation intensive de 9 mois, mais j'ai besoin de financer ma vie quotidienne pendant cette période.",
  },
];

