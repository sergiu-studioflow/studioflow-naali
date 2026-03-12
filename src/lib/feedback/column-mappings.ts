// Column mappings for each CSV source type
// Maps CSV column headers to normalized customer_reviews fields

export type SourceType = "asg_survey" | "mag_survey" | "menopause_survey" | "reorder_survey";

export type ColumnMapping = {
  label: string;
  productContext: string;
  fields: Record<string, string>; // CSV column name -> DB field name
};

// Common fields shared across all survey types
const COMMON_FIELDS: Record<string, string> = {
  "Full Name": "customerName",
  "Email": "customerEmail",
  "Total Spent": "totalSpent",
  "Orders Count": "ordersCount",
  "Submitted At": "submittedAt",
  "First Visit UTM Source": "utmSource",
  "Où avez-vous découvert Naali ?": "discoverySource",
  "Quel influenceur ?": "influencerSource",
};

export const SOURCE_TYPES: Record<SourceType, ColumnMapping> = {
  asg_survey: {
    label: "Anti-Stress Gummies Survey",
    productContext: "Anti-Stress Gummies",
    fields: {
      ...COMMON_FIELDS,
      "Quel est votre problème #1 qui vous a poussée à acheter ce gummies anti-stress aujourd'hui ?": "mainProblem",
      "Qu'est-ce qui vous inquiète le plus par rapport à votre état actuel ?": "problemDescription",
      "Qu'est-ce que ces symptômes vous empêchent de réaliser au quotidien ? Comment cela impactait vos proches ou votre vie ?": "dailyImpact",
      "Si vous deviez décrire comment vous vous sentez en ce moment en 3 mots\n lesquels choisiriez-vous ?": "moodWords",
      " Qu'est-ce qui vous a fait hésiter avant d'acheter ? (et qu'est-ce qui vous a finalement convaincue ?)": "purchaseHesitations",
      "Quelle est LA principale raison pour laquelle vous avez acheté Naali ?": "whyPurchased",
      "Qu'attendez-vous de ce produit dans votre vie ?": "expectedOutcome",
      "Qu'est-ce que vous espérez pouvoir refaire ou retrouver grâce aux gummies anti-stress ?": "whatConvinced",
      "Pourquoi êtes vous stressés ?": "reviewText",
      "Qu'est-ce qui a failli vous empêcher d'acheter sur Naali ?": "purchaseHesitations",
    },
  },

  mag_survey: {
    label: "Magnesium+ Survey",
    productContext: "Magnesium+",
    fields: {
      ...COMMON_FIELDS,
      "Quel est votre problème #1 qui vous a poussée à acheter ce magnésium aujourd'hui ?": "mainProblem",
      "Qu'est-ce qui vous inquiète le plus par rapport à votre état actuel ?": "problemDescription",
      "Qu'est-ce que ces symptômes vous empêchent de réaliser au quotidien ? Comment cela impactait vos proches ou votre vie ?": "dailyImpact",
      "Si vous deviez décrire comment vous vous sentez en ce moment en 3 mots\n lesquels choisiriez-vous ?": "moodWords",
      " Qu'est-ce qui vous a fait hésiter avant d'acheter ? (et qu'est-ce qui vous a finalement convaincue ?)": "purchaseHesitations",
      "Quelle est LA principale raison pour laquelle vous avez acheté Naali ?": "whyPurchased",
      "Qu'est-ce que vous espérez pouvoir refaire ou retrouver grâce au magnésium ?": "whatConvinced",
    },
  },

  menopause_survey: {
    label: "Menopause Survey",
    productContext: "Menopause",
    fields: {
      ...COMMON_FIELDS,
      "Avant votre achat\n que se passait-il dans votre vie ou dans votre corps qui vous a fait réaliser que vous ne pouviez plus continuer ainsi ?": "reviewText",
      "Quels symptômes impactent le plus votre vie quotidienne actuellement ?": "mainProblem",
      "Parmi toutes les solutions que vous avez testées auparavant\n qu'est-ce qui vous a donné assez de confiance en CE produit pour l'acheter ?": "whatConvinced",
      "Si ce produit fonctionnait exactement comme vous l'espérez\n quel serait le tout premier changement que vous aimeriez ressentir ou observer ?": "expectedOutcome",
      "Pourquoi avez-vous acheté ce produit ?": "whyPurchased",
      "Qu'est-ce que la ménopause vous empêche de faire au quotidien ?": "dailyImpact",
    },
  },

  reorder_survey: {
    label: "Reorder Survey (Why Reorder)",
    productContext: "Multiple/Unknown",
    fields: {
      ...COMMON_FIELDS,
      "Pourquoi avez vous décidé de repasser commande ?": "reviewText",
      // Some files have the full question with emoji
      "Pourquoi avez vous décidé de repasser commande ? comment nos produits ont changé votre vie ?": "reviewText",
    },
  },
};

// Map a raw CSV row to normalized review fields using the source type mapping
export function mapCsvRow(
  row: Record<string, string>,
  sourceType: SourceType
): Record<string, unknown> {
  const mapping = SOURCE_TYPES[sourceType];
  if (!mapping) throw new Error(`Unknown source type: ${sourceType}`);

  const result: Record<string, unknown> = {
    sourceType,
    productContext: mapping.productContext,
    rawData: row,
  };

  // Apply field mappings - try each CSV column name
  for (const [csvColumn, dbField] of Object.entries(mapping.fields)) {
    // Try exact match first
    let value = row[csvColumn];

    // If no exact match, try fuzzy match (CSV headers sometimes have extra whitespace or quotes)
    if (value === undefined) {
      const normalizedKey = csvColumn.replace(/\s+/g, " ").trim();
      for (const [key, val] of Object.entries(row)) {
        const normalizedRowKey = key.replace(/\s+/g, " ").trim();
        if (normalizedRowKey === normalizedKey) {
          value = val;
          break;
        }
      }
    }

    if (value && value.trim()) {
      // Don't overwrite if already set (first match wins)
      if (!result[dbField]) {
        result[dbField] = value.trim();
      }
    }
  }

  // Handle ordersCount as integer
  if (result.ordersCount) {
    result.ordersCount = parseInt(result.ordersCount as string, 10) || null;
  }

  // For menopause, extract symptoms checkbox field as jsonb array
  if (sourceType === "menopause_survey") {
    const symptomsRaw = row["Quels symptômes impactent le plus votre vie quotidienne actuellement ?"];
    const symptomsOther = row["Quels symptômes impactent le plus votre vie quotidienne actuellement ? - Other"];
    if (symptomsRaw) {
      const symptoms = symptomsRaw.split(",").map((s) => s.trim()).filter(Boolean);
      if (symptomsOther && symptomsOther.trim()) {
        symptoms.push(symptomsOther.trim());
      }
      result.symptoms = symptoms;
    }
  }

  return result;
}

export const SOURCE_TYPE_OPTIONS: Array<{ value: SourceType; label: string }> = [
  { value: "asg_survey", label: "Anti-Stress Gummies Survey" },
  { value: "mag_survey", label: "Magnesium+ Survey" },
  { value: "menopause_survey", label: "Menopause Survey" },
  { value: "reorder_survey", label: "Reorder Survey" },
];

/** Auto-detect source type from CSV headers */
export function detectSourceType(headers: string[]): SourceType | null {
  const joined = headers.join(" ").toLowerCase();

  if (joined.includes("gummies anti-stress") || joined.includes("anti-stress")) {
    return "asg_survey";
  }
  if (joined.includes("magnésium") || joined.includes("magnesium")) {
    return "mag_survey";
  }
  if (joined.includes("ménopause") || joined.includes("menopause")) {
    return "menopause_survey";
  }
  if (joined.includes("repasser commande")) {
    return "reorder_survey";
  }

  return null;
}
