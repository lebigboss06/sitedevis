"use client";

import { useEffect, useMemo, useState } from "react";

type AppView = "create" | "quotes" | "clients" | "settings";

type QuoteLine = {
  reference: string;
  designation: string;
  quantite: string;
  puHT: string;
  tva: string;
};

type SavedQuote = {
  id: number;
  numero: string;
  date: string;
  clientNom: string;
  clientAdresse: string;
  companyNom: string;
  companyAdresse: string;
  companyEmail: string;
  lines: QuoteLine[];
  notes: string;
  conditions: string;
  statut: "Brouillon" | "Finalisé";
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
};

type CompanyInfo = {
  logoText: string;
  nom: string;
  adresse: string;
  email: string;
};

type AIGeneratorTemplate = {
  professionalDescription: string;
  materials: string[];
  lines: QuoteLine[];
};

const QUOTES_KEY = "henri_like_quotes";
const COUNTER_KEY = "henri_like_quote_counter";
const COMPANY_KEY = "henri_like_company";
const SAVED_QUOTES_KEY = "savedQuotes";

const toNumber = (value: string) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const euro = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);

const makeLine = (): QuoteLine => ({
  reference: "",
  designation: "",
  quantite: "1",
  puHT: "",
  tva: "20",
});

const getAIGeneratorTemplate = (input: string): AIGeneratorTemplate => {
  const prompt = input.toLowerCase();

  if (prompt.includes("renovation salle de bain") || prompt.includes("salle de bain")) {
    return {
      professionalDescription:
        "Realisation de travaux complets de renovation de salle de bain incluant la preparation des supports, la pose de carrelage et les interventions de plomberie.",
      materials: ["Carrelage mural et sol", "Colle et joints", "Robinetterie", "Tuyauterie"],
      lines: [
        {
          reference: "SDB-01",
          designation: "Preparation chantier et depose des anciens elements",
          quantite: "1",
          puHT: "650",
          tva: "20",
        },
        {
          reference: "SDB-02",
          designation: "Pose carrelage sol et murs salle de bain",
          quantite: "12",
          puHT: "85",
          tva: "20",
        },
        {
          reference: "SDB-03",
          designation: "Interventions plomberie et raccordements sanitaires",
          quantite: "1",
          puHT: "980",
          tva: "20",
        },
      ],
    };
  }

  if (prompt.includes("carrelage")) {
    return {
      professionalDescription:
        "Realisation de travaux de carrelage comprenant la preparation des surfaces, la pose et les finitions de joints.",
      materials: ["Carrelage", "Colle carrelage", "Joints hydrofuges", "Croisillons"],
      lines: [
        {
          reference: "CAR-01",
          designation: "Preparation des supports",
          quantite: "1",
          puHT: "280",
          tva: "20",
        },
        {
          reference: "CAR-02",
          designation: "Pose de carrelage",
          quantite: "20",
          puHT: "52",
          tva: "20",
        },
      ],
    };
  }

  if (prompt.includes("peinture")) {
    return {
      professionalDescription:
        "Realisation de travaux de peinture interieure avec protection, preparation des murs et application de deux couches de finition.",
      materials: ["Sous-couche", "Peinture finition", "Baches de protection", "Ruban de masquage"],
      lines: [
        {
          reference: "PEIN-01",
          designation: "Protection des zones et preparation des surfaces",
          quantite: "1",
          puHT: "320",
          tva: "20",
        },
        {
          reference: "PEIN-02",
          designation: "Application peinture en deux couches",
          quantite: "45",
          puHT: "18",
          tva: "20",
        },
      ],
    };
  }

  if (prompt.includes("plomberie")) {
    return {
      professionalDescription:
        "Realisation de travaux de plomberie comprenant la mise a niveau du reseau, la pose d'equipements et les tests d'etancheite.",
      materials: ["Tubes multicouches", "Raccords", "Robinetterie", "Elements de fixation"],
      lines: [
        {
          reference: "PLOM-01",
          designation: "Diagnostic et mise a niveau du reseau plomberie",
          quantite: "1",
          puHT: "390",
          tva: "20",
        },
        {
          reference: "PLOM-02",
          designation: "Pose et raccordement des equipements sanitaires",
          quantite: "1",
          puHT: "860",
          tva: "20",
        },
      ],
    };
  }

  if (prompt.includes("demolition")) {
    return {
      professionalDescription:
        "Realisation de travaux de demolition controles, evacuation des gravats et remise en etat initiale de la zone de travail.",
      materials: ["Sacs gravats", "Protections chantier", "Consommables de demolition"],
      lines: [
        {
          reference: "DEM-01",
          designation: "Mise en securite de la zone",
          quantite: "1",
          puHT: "240",
          tva: "20",
        },
        {
          reference: "DEM-02",
          designation: "Demolition et evacuation des gravats",
          quantite: "1",
          puHT: "1150",
          tva: "20",
        },
      ],
    };
  }

  if (prompt.includes("cuisine")) {
    return {
      professionalDescription:
        "Realisation de travaux de renovation de cuisine incluant depose, adaptation des reseaux techniques et installation des nouveaux elements.",
      materials: ["Plan de travail", "Elements bas et hauts", "Raccords plomberie", "Raccords electriques"],
      lines: [
        {
          reference: "CUI-01",
          designation: "Depose de l'ancienne cuisine",
          quantite: "1",
          puHT: "540",
          tva: "20",
        },
        {
          reference: "CUI-02",
          designation: "Preparation reseaux et pose nouvelle cuisine",
          quantite: "1",
          puHT: "1850",
          tva: "20",
        },
      ],
    };
  }

  if (prompt.includes("electricite") || prompt.includes("electrique")) {
    return {
      professionalDescription:
        "Realisation de travaux electriques comprenant la mise en conformite, le tirage des lignes et la pose des appareillages.",
      materials: ["Cables", "Disjoncteurs", "Prises et interrupteurs", "Tableau electrique"],
      lines: [
        {
          reference: "ELEC-01",
          designation: "Mise en securite et preparation du reseau",
          quantite: "1",
          puHT: "430",
          tva: "20",
        },
        {
          reference: "ELEC-02",
          designation: "Tirage de lignes et pose appareillages",
          quantite: "1",
          puHT: "1320",
          tva: "20",
        },
      ],
    };
  }

  return {
    professionalDescription:
      "Realisation de travaux selon cahier des charges client, avec preparation du chantier, execution des prestations et finitions de qualite.",
    materials: ["Consommables chantier", "Materiaux principaux", "Elements de finition"],
    lines: [
      {
        reference: "GEN-01",
        designation: "Preparation et organisation du chantier",
        quantite: "1",
        puHT: "350",
        tva: "20",
      },
      {
        reference: "GEN-02",
        designation: "Execution des prestations principales",
        quantite: "1",
        puHT: "980",
        tva: "20",
      },
    ],
  };
};

export default function Page() {
  const [activeView, setActiveView] = useState<AppView>("create");
  const [isHydrated, setIsHydrated] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);

  const [quoteCounter, setQuoteCounter] = useState(0);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);

  const [company, setCompany] = useState<CompanyInfo>({
    logoText: "HF",
    nom: "Henri BTP",
    adresse: "12 rue des Artisans, 75000 Paris",
    email: "contact@henrifacturation.fr",
  });

  const [clientNom, setClientNom] = useState("");
  const [clientAdresse, setClientAdresse] = useState("");
  const [siteDescriptionPrompt, setSiteDescriptionPrompt] = useState("");
  const [notes, setNotes] = useState("Merci pour votre confiance.");
  const [conditions, setConditions] = useState(
    "Paiement a 30 jours. Acompte de 40% a la commande."
  );
  const [lines, setLines] = useState<QuoteLine[]>([makeLine()]);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    try {
      const storedQuotes = window.localStorage.getItem(QUOTES_KEY);
      const legacyStoredQuotes = window.localStorage.getItem(SAVED_QUOTES_KEY);
      const storedCounter = window.localStorage.getItem(COUNTER_KEY);
      const storedCompany = window.localStorage.getItem(COMPANY_KEY);
      const quotesPayload = storedQuotes ?? legacyStoredQuotes;
      if (quotesPayload) {
        const parsed = JSON.parse(quotesPayload) as SavedQuote[];
        if (Array.isArray(parsed)) {
          const normalizedQuotes = parsed.map((quote) => ({
            ...quote,
            statut: quote.statut ?? "Brouillon",
          }));
          setSavedQuotes(normalizedQuotes);
        }
      }
      if (storedCounter) {
        const parsedCounter = Number(storedCounter);
        if (Number.isFinite(parsedCounter)) setQuoteCounter(parsedCounter);
      }
      if (storedCompany) {
        const parsedCompany = JSON.parse(storedCompany) as CompanyInfo;
        if (parsedCompany && typeof parsedCompany === "object") {
          setCompany(parsedCompany);
        }
      }
    } catch {
      setErrorMessage("Impossible de charger les donnees sauvegardees.");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(QUOTES_KEY, JSON.stringify(savedQuotes));
    window.localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(savedQuotes));
  }, [savedQuotes, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(COUNTER_KEY, String(quoteCounter));
  }, [quoteCounter, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
  }, [company, isHydrated]);

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        const qte = toNumber(line.quantite);
        const pu = toNumber(line.puHT);
        const tvaRate = toNumber(line.tva);
        const lineHT = qte * pu;
        const lineTVA = lineHT * (tvaRate / 100);
        return {
          totalHT: acc.totalHT + lineHT,
          totalTVA: acc.totalTVA + lineTVA,
          totalTTC: acc.totalTTC + lineHT + lineTVA,
        };
      },
      { totalHT: 0, totalTVA: 0, totalTTC: 0 }
    );
  }, [lines]);

  const nextQuoteNumber = `DEV-${String(quoteCounter + 1).padStart(3, "0")}`;
  const selectedQuote = savedQuotes.find((quote) => quote.id === selectedQuoteId) ?? null;
  const printQuote = selectedQuote
    ? selectedQuote
    : {
        numero: nextQuoteNumber,
        date: new Date().toLocaleDateString("fr-FR"),
        clientNom,
        clientAdresse,
        companyNom: company.nom,
        companyAdresse: company.adresse,
        companyEmail: company.email,
        lines,
        notes,
        conditions,
        totalHT: totals.totalHT,
        totalTVA: totals.totalTVA,
        totalTTC: totals.totalTTC,
      };

  const suggestedFileName = `${printQuote.numero}.pdf`;

  const addLine = () => setLines((prev) => [...prev, makeLine()]);

  const generateQuoteWithAI = () => {
    if (!siteDescriptionPrompt.trim()) {
      setErrorMessage("Decrivez votre chantier avant de lancer la generation IA.");
      setSuccessMessage("");
      return;
    }

    const template = getAIGeneratorTemplate(siteDescriptionPrompt);
    const materialsLine = template.materials.join(", ");

    setLines(template.lines);
    setNotes(
      `Description professionnelle:\n${template.professionalDescription}\n\nMateriaux suggeres:\n${materialsLine}`
    );
    setConditions("Paiement a 30 jours. Acompte de 40% a la commande.");
    setErrorMessage("");
    setSuccessMessage("Devis genere automatiquement avec IA simulee.");
  };

  const updateLine = (index: number, key: keyof QuoteLine, value: string) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [key]: value } : line)));
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) {
      setLines([makeLine()]);
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const resetEditor = () => {
    setClientNom("");
    setClientAdresse("");
    setLines([makeLine()]);
    setNotes("Merci pour votre confiance.");
    setConditions("Paiement a 30 jours. Acompte de 40% a la commande.");
  };

  const saveCurrentQuote = (status: "Brouillon" | "Finalisé") => {
    const hasAtLeastOneLine = lines.some((line) => {
      const hasContent = line.designation.trim() || line.reference.trim();
      return Boolean(hasContent) || toNumber(line.puHT) > 0;
    });
    if (!clientNom.trim() || !clientAdresse.trim()) {
      setErrorMessage("Renseignez le client (nom et adresse).");
      setSuccessMessage("");
      return;
    }
    if (!hasAtLeastOneLine) {
      setErrorMessage("Ajoutez ou générez au moins une ligne");
      setSuccessMessage("");
      return;
    }

    const cleanedLines = lines.map((line) => ({
      reference: line.reference.trim(),
      designation: line.designation.trim(),
      quantite: line.quantite || "1",
      puHT: line.puHT || "0",
      tva: line.tva || "20",
    }));

    const nextCounter = quoteCounter + 1;
    const numero = `DEV-${String(nextCounter).padStart(3, "0")}`;
    const newQuote: SavedQuote = {
      id: Date.now(),
      numero,
      date: new Date().toLocaleDateString("fr-FR"),
      clientNom: clientNom.trim(),
      clientAdresse: clientAdresse.trim(),
      companyNom: company.nom,
      companyAdresse: company.adresse,
      companyEmail: company.email,
      lines: cleanedLines,
      notes,
      conditions,
      statut: status,
      totalHT: totals.totalHT,
      totalTVA: totals.totalTVA,
      totalTTC: totals.totalTTC,
    };

    setSavedQuotes((prev) => [newQuote, ...prev]);
    setQuoteCounter(nextCounter);
    setSuccessMessage(status === "Finalisé" ? "Devis finalisé" : "Devis sauvegardé");
    setErrorMessage("");
    setSelectedQuoteId(newQuote.id);
    setActiveView("quotes");
    resetEditor();
  };

  const deleteQuote = (quoteId: number) => {
    const confirmed = window.confirm("Supprimer ce devis ?");
    if (!confirmed) return;
    setSavedQuotes((prev) => prev.filter((quote) => quote.id !== quoteId));
    if (selectedQuoteId === quoteId) setSelectedQuoteId(null);
  };

  const printDocument = () => window.print();

  const downloadPdf = () => {
    const previousTitle = document.title;
    document.title = suggestedFileName;
    window.print();
    setTimeout(() => {
      document.title = previousTitle;
    }, 300);
  };

  const menuItems: { id: AppView; label: string }[] = [
    { id: "create", label: "Creer un devis" },
    { id: "quotes", label: "Mes devis" },
    { id: "clients", label: "Clients" },
    { id: "settings", label: "Parametres" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1600px] p-3 md:p-6">
        {errorMessage && (
          <p className="no-print mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="no-print mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
          <aside className="no-print rounded-2xl border border-blue-100 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeView === item.id
                      ? "bg-blue-600 text-white shadow"
                      : "text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  {item.label}
                  {item.id === "quotes" && ` (${savedQuotes.length})`}
                </button>
              ))}
            </nav>
          </aside>

          <section className="min-w-0">
            {activeView === "create" && (
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
                <header className="border-b border-slate-200 pb-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
                        {company.logoText || "HF"}
                      </div>
                      <div className="space-y-2">
                        <input
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
                          value={company.nom}
                          onChange={(e) =>
                            setCompany((prev) => ({ ...prev, nom: e.target.value }))
                          }
                          placeholder="Nom entreprise"
                        />
                        <input
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                          value={company.adresse}
                          onChange={(e) =>
                            setCompany((prev) => ({ ...prev, adresse: e.target.value }))
                          }
                          placeholder="Adresse entreprise"
                        />
                        <input
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                          value={company.email}
                          onChange={(e) =>
                            setCompany((prev) => ({ ...prev, email: e.target.value }))
                          }
                          placeholder="Email entreprise"
                        />
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 text-sm">
                      <p className="font-semibold text-slate-800">DEVIS {nextQuoteNumber}</p>
                      <p className="mt-1 text-slate-500">
                        Date: {new Date().toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={clientNom}
                      onChange={(e) => setClientNom(e.target.value)}
                      placeholder="Nom client"
                    />
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={clientAdresse}
                      onChange={(e) => setClientAdresse(e.target.value)}
                      placeholder="Adresse client"
                    />
                  </div>
                </header>

                <section className="no-print mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
                  <label className="mb-2 block text-sm font-semibold text-blue-800">
                    Decrivez votre chantier
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-base"
                    rows={3}
                    placeholder="Exemple : renovation salle de bain"
                    value={siteDescriptionPrompt}
                    onChange={(e) => setSiteDescriptionPrompt(e.target.value)}
                  />
                  <button
                    onClick={generateQuoteWithAI}
                    className="mt-3 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Generer le devis avec IA
                  </button>
                </section>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full border border-slate-200 text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="border border-slate-200 px-3 py-3 text-left">Reference</th>
                        <th className="border border-slate-200 px-3 py-3 text-left">Designation</th>
                        <th className="border border-slate-200 px-3 py-3 text-left">Quantite</th>
                        <th className="border border-slate-200 px-3 py-3 text-left">PU HT</th>
                        <th className="border border-slate-200 px-3 py-3 text-left">TVA</th>
                        <th className="border border-slate-200 px-3 py-3 text-left">Total HT</th>
                        <th className="no-print border border-slate-200 px-3 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, index) => {
                        const lineTotalHT = toNumber(line.quantite) * toNumber(line.puHT);
                        return (
                          <tr key={index} className="align-top">
                            <td className="border border-slate-200 px-2 py-2">
                              <input
                                className="w-full rounded-md border border-slate-300 px-2 py-2"
                                value={line.reference}
                                onChange={(e) => updateLine(index, "reference", e.target.value)}
                              />
                            </td>
                            <td className="border border-slate-200 px-2 py-2">
                              <textarea
                                className="w-full rounded-md border border-slate-300 px-2 py-2"
                                rows={2}
                                value={line.designation}
                                onChange={(e) => updateLine(index, "designation", e.target.value)}
                              />
                            </td>
                            <td className="border border-slate-200 px-2 py-2">
                              <input
                                className="w-full rounded-md border border-slate-300 px-2 py-2"
                                type="number"
                                min="0"
                                value={line.quantite}
                                onChange={(e) => updateLine(index, "quantite", e.target.value)}
                              />
                            </td>
                            <td className="border border-slate-200 px-2 py-2">
                              <input
                                className="w-full rounded-md border border-slate-300 px-2 py-2"
                                type="number"
                                min="0"
                                value={line.puHT}
                                onChange={(e) => updateLine(index, "puHT", e.target.value)}
                              />
                            </td>
                            <td className="border border-slate-200 px-2 py-2">
                              <input
                                className="w-full rounded-md border border-slate-300 px-2 py-2"
                                type="number"
                                min="0"
                                value={line.tva}
                                onChange={(e) => updateLine(index, "tva", e.target.value)}
                              />
                            </td>
                            <td className="border border-slate-200 px-3 py-2 font-semibold text-blue-700">
                              {euro(lineTotalHT)}
                            </td>
                            <td className="no-print border border-slate-200 px-2 py-2">
                              <button
                                onClick={() => removeLine(index)}
                                className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={addLine}
                  className="no-print mt-4 rounded-xl border border-blue-300 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  + Ajouter une ligne
                </button>

                <footer className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Notes du devis
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Conditions
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        rows={3}
                        value={conditions}
                        onChange={(e) => setConditions(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm">
                    <p className="flex justify-between">
                      <span>Total HT</span>
                      <strong>{euro(totals.totalHT)}</strong>
                    </p>
                    <p className="mt-1 flex justify-between">
                      <span>TVA</span>
                      <strong>{euro(totals.totalTVA)}</strong>
                    </p>
                    <p className="mt-1 flex justify-between text-base">
                      <span>Total TTC</span>
                      <strong>{euro(totals.totalTTC)}</strong>
                    </p>
                  </div>
                </footer>
              </article>
            )}

            {activeView === "quotes" && (
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-blue-700">Mes devis</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Liste des devis sauvegardes avec acces detaille.
                </p>

                {selectedQuote ? (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      {selectedQuote.numero} - {selectedQuote.date}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-blue-700">
                      Statut: {selectedQuote.statut}
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedQuote.clientNom}</p>
                    <p className="text-sm text-slate-600">{selectedQuote.clientAdresse}</p>
                    <div className="mt-4 space-y-2">
                      {selectedQuote.lines.map((line, index) => {
                        const lineHT = toNumber(line.quantite) * toNumber(line.puHT);
                        const lineTVA = lineHT * (toNumber(line.tva) / 100);
                        const lineTTC = lineHT + lineTVA;
                        return (
                          <div key={`${selectedQuote.id}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
                            <p className="font-medium text-slate-900">{line.designation || "-"}</p>
                            <p className="text-sm text-slate-600">
                              Ref: {line.reference || "-"} | Qte: {line.quantite} | PU:{" "}
                              {euro(toNumber(line.puHT))} | TVA: {line.tva}% | TTC:{" "}
                              {euro(lineTTC)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm">
                      <p className="flex justify-between">
                        <span>Total HT</span>
                        <strong>{euro(selectedQuote.totalHT)}</strong>
                      </p>
                      <p className="mt-1 flex justify-between">
                        <span>TVA</span>
                        <strong>{euro(selectedQuote.totalTVA)}</strong>
                      </p>
                      <p className="mt-1 flex justify-between text-base">
                        <span>Total TTC</span>
                        <strong>{euro(selectedQuote.totalTTC)}</strong>
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedQuoteId(null)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Retour aux devis
                      </button>
                      <button
                        onClick={printDocument}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Imprimer
                      </button>
                      <button
                        onClick={downloadPdf}
                        className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Telecharger PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {savedQuotes.length === 0 ? (
                      <p className="rounded-lg border border-slate-200 p-3 text-sm text-slate-500">
                        Aucun devis sauvegarde.
                      </p>
                    ) : (
                      savedQuotes.map((quote) => (
                        <article key={quote.id} className="rounded-xl border border-slate-200 p-4">
                          <p className="text-sm text-slate-500">
                            {quote.numero} - {quote.date}
                          </p>
                          <p className="font-semibold text-slate-900">{quote.clientNom}</p>
                          <p className="mt-1 text-xs font-semibold text-blue-700">
                            Statut: {quote.statut}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-blue-700">
                            Total TTC: {euro(quote.totalTTC)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() => setSelectedQuoteId(quote.id)}
                              className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                            >
                              Voir
                            </button>
                            <button
                              onClick={() => deleteQuote(quote.id)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                            >
                              Supprimer
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                )}
              </article>
            )}

            {activeView === "clients" && (
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-blue-700">Clients</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Cette section sera enrichie prochainement. Les clients sont deja visibles dans vos devis sauvegardes.
                </p>
              </article>
            )}

            {activeView === "settings" && (
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-blue-700">Parametres</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Personnalisez les informations de votre entreprise directement en haut du devis.
                </p>
              </article>
            )}
          </section>

          <aside className="no-print rounded-2xl border border-blue-100 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-fit">
            <h3 className="text-lg font-bold text-blue-700">Actions</h3>
            <p className="mt-1 text-sm text-slate-500">Panneau rapide pour finaliser votre devis.</p>
            <div className="mt-4 space-y-3">
              <button
                onClick={() => saveCurrentQuote("Finalisé")}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Finaliser le devis
              </button>
              <button
                onClick={() => saveCurrentQuote("Brouillon")}
                className="w-full rounded-xl border border-blue-300 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Sauvegarder
              </button>
              <button
                onClick={downloadPdf}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Telecharger PDF
              </button>
              <button
                onClick={printDocument}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Imprimer
              </button>
              <button
                onClick={() => setShowPreview((prev) => !prev)}
                className="w-full rounded-xl border border-blue-300 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Voir apercu
              </button>
            </div>
          </aside>
        </div>

        {showPreview && (
          <div className="no-print mt-4 rounded-2xl border border-slate-300 bg-slate-100 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-600">Apercu rapide</p>
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">
                {nextQuoteNumber} - {new Date().toLocaleDateString("fr-FR")}
              </p>
              <p className="mt-1 font-semibold text-slate-900">{clientNom || "Nom client"}</p>
              <p className="text-sm text-slate-600">{clientAdresse || "Adresse client"}</p>
              <p className="mt-3 text-sm text-slate-700">Total TTC: {euro(totals.totalTTC)}</p>
            </section>
          </div>
        )}

        <section className="print-only print-a4">
          <header className="border-b border-slate-300 pb-4">
            <p className="text-sm text-slate-500">
              DEVIS N° {printQuote.numero} | Date: {printQuote.date}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{printQuote.companyNom}</h2>
            <p className="text-sm text-slate-600">{printQuote.companyAdresse}</p>
            <p className="text-sm text-slate-600">{printQuote.companyEmail}</p>
            <p className="mt-3 text-sm text-slate-800">Client: {printQuote.clientNom || "-"}</p>
            <p className="text-sm text-slate-600">{printQuote.clientAdresse || "-"}</p>
          </header>
          <table className="mt-6 w-full border border-slate-300 text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="border border-slate-300 px-3 py-2">Reference</th>
                <th className="border border-slate-300 px-3 py-2">Designation</th>
                <th className="border border-slate-300 px-3 py-2">Quantite</th>
                <th className="border border-slate-300 px-3 py-2">PU HT</th>
                <th className="border border-slate-300 px-3 py-2">TVA</th>
                <th className="border border-slate-300 px-3 py-2">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {printQuote.lines.map((line, index) => {
                const lineHT = toNumber(line.quantite) * toNumber(line.puHT);
                return (
                  <tr key={`${line.reference}-print-${index}`}>
                    <td className="border border-slate-300 px-3 py-2">{line.reference}</td>
                    <td className="border border-slate-300 px-3 py-2">{line.designation}</td>
                    <td className="border border-slate-300 px-3 py-2">{line.quantite}</td>
                    <td className="border border-slate-300 px-3 py-2">
                      {euro(toNumber(line.puHT))}
                    </td>
                    <td className="border border-slate-300 px-3 py-2">{line.tva}%</td>
                    <td className="border border-slate-300 px-3 py-2">{euro(lineHT)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-6 ml-auto w-full max-w-xs rounded-lg border border-slate-300 p-3 text-sm">
            <p className="flex justify-between">
              <span>Total HT</span>
              <strong>{euro(printQuote.totalHT)}</strong>
            </p>
            <p className="mt-1 flex justify-between">
              <span>TVA</span>
              <strong>{euro(printQuote.totalTVA)}</strong>
            </p>
            <p className="mt-1 flex justify-between text-base">
              <span>Total TTC</span>
              <strong>{euro(printQuote.totalTTC)}</strong>
            </p>
          </div>
          <div className="mt-5 text-sm text-slate-600">
            <p>
              <strong>Notes:</strong> {printQuote.notes}
            </p>
            <p className="mt-1">
              <strong>Conditions:</strong> {printQuote.conditions}
            </p>
          </div>
        </section>

        <style jsx global>{`
          .print-only {
            display: none;
          }
          @page {
            size: A4;
            margin: 12mm;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            .print-only {
              display: block !important;
            }
            .print-a4 {
              max-width: 210mm;
              margin: 0 auto;
              color: #111827;
              background: white;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
