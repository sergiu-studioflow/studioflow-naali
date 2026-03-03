import postgres from "postgres";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set. Use: DOTENV_CONFIG_PATH=.env.local npx tsx scripts/migrate-from-airtable.ts");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

// =============================================
// AIRTABLE DATA — Personas (4 records from appziTBO4sBPJvh5l)
// =============================================

const personas = [
  {
    airtable_record_id: "recHp5RwYXgl1XDCW",
    name: "Marie - The Overwhelmed Mother",
    label: "Overwhelmed Mother",
    demographics: "38 years old, married, two children (6 and 9), works part-time in HR, lives in suburban Lyon.",
    situation: "Marie returned to work after her second maternity leave and never recovered her equilibrium. She manages the household logistics - school pickups, doctor appointments, meal planning, homework supervision - while also maintaining a professional role. Her husband helps but does not see the invisible labour. She is the project manager of a life that has too many tasks and not enough time.",
    pain_points: "She wakes up at 3am unable to stop her mind. She has gained 8kg in two years. She snaps at her children and then cries in the bathroom. She has started losing hair. Her libido is non-existent. She is exhausted but cannot sleep deeply.",
    what_they_tried: "Meditation app (gave up after 2 weeks), herbal sleep tea (didn't work), her GP (offered antidepressants, she refused), a weekend spa trip (temporary relief).",
    what_they_want: "To feel like herself again. To have patience for her children. To wake up feeling rested. To stop dreading each day.",
    objections: `"Another supplement that won't work." "It's expensive." "I don't have time to research if it's legitimate."`,
    conversion_triggers: "A testimonial from another mother describing the same symptoms. The M6 TV appearance as proof of legitimacy. A first-purchase discount to reduce risk",
    messaging_notes: `"Retrouver votre calme avec vos enfants." "Vous méritez une nuit complète." "Naturel, sans médicament."`,
    compliance_note: null,
    sort_order: 1,
  },
  {
    airtable_record_id: "recoui6oh4R6ZewST",
    name: "Sophie - The High-Performing Professional",
    label: "High-Performing Professional",
    demographics: "44 years old, single, senior manager at a consulting firm, lives in Paris.",
    situation: "Sophie built her career through relentless work. She has always been the one who delivers, who stays late, who takes on more. Recently, she has started to break. The pace that once energised her now depletes her. She has anxiety before meetings she used to run with confidence. She has started calling in sick - something she never did before.",
    pain_points: "Heart palpitations. Digestive problems. Insomnia before big presentations. Difficulty concentrating - she reads the same email three times. Brain fog. A persistent sense that she is about to be \"found out\" as incompetent.",
    what_they_tried: "Performance coaching, productivity systems, CBD oil (felt nothing), reduced alcohol (helped slightly), considered therapy (hasn't scheduled).",
    what_they_want: "To perform at her previous level. To not dread work. To feel sharp again. To stop the physical anxiety symptoms.",
    objections: `"Supplements are for hippies, not professionals." "If this worked, my doctor would have recommended it." "I need something stronger."`,
    conversion_triggers: "Scientific credibility. The founder story (she respects entrepreneurs). Discreet product format (gummies, not pills). Framing as \"optimisation\" not \"treatment.\"",
    messaging_notes: `"Le safran utilisé depuis des siècles pour la clarté mentale." "Pour les femmes qui ne peuvent pas se permettre d'être ralenties." "Retrouvez votre concentration."`,
    compliance_note: null,
    sort_order: 2,
  },
  {
    airtable_record_id: "recqsHb0bsmCh5Bja",
    name: "Nathalie - The Menopause Sufferer",
    label: "Menopause Sufferer",
    demographics: "52 years old, married, adult children, works as a schoolteacher, lives in Toulouse.",
    situation: "Nathalie entered perimenopause three years ago and menopause last year. She was unprepared for the severity. Hot flashes wake her 4-5 times per night. She has gained weight despite not changing her diet. She has mood swings that frighten her - rage that comes from nowhere. She feels like she is losing her mind.",
    pain_points: "Severe hot flashes, especially at night. Night sweats that soak the sheets. Weight gain (especially abdominal). Mood volatility. Brain fog - she forgets students' names she's known for years. Low libido. Vaginal dryness.",
    what_they_tried: "Her gynaecologist recommended HRT but she's afraid of the cancer risk. She tried soy isoflavones (no effect). Black cohosh (mild effect). Evening primrose oil (no effect). She is desperate.",
    what_they_want: "To sleep through the night. To not be drenched in sweat. To feel emotionally stable. To recognise herself.",
    objections: `"Another supplement that promises menopause relief and delivers nothing." "I've wasted so much money already." "This is for young stressed women, not menopause."`,
    conversion_triggers: "Testimonials specifically from menopausal women. The specific claim \"contribue à soulager les symptômes de la ménopause\" (note: this claim exists for saffron but must be verified as applicable to this product formulation). Proof of understanding her specific situation.",
    messaging_notes: `"Les bouffées de chaleur qui vous réveillent à 3h du matin." "Vous avez tout essayé pour la ménopause - sauf ça." "Retrouvez des nuits complètes."`,
    compliance_note: null,
    sort_order: 3,
  },
  {
    airtable_record_id: "recwONcpNONk75u0P",
    name: "Celine - The Mother of an ADHD Child",
    label: "Mother of ADHD Child",
    demographics: "41 years old, divorced, one son (11 years old) diagnosed with ADHD, administrative assistant, lives in Bordeaux.",
    situation: "Celine's son was diagnosed with ADHD two years ago. The paediatrician recommended medication, but Celine has resisted - she's seen the side effects in other children, the appetite suppression, the zombie-like affect. She has tried behavioural therapy, diet changes, routine structures. Some help, none solve. She is exhausted from the daily battles - homework, bedtime, emotional meltdowns. She originally bought Naali for herself, then cautiously tried it with her son. She saw a difference.",
    pain_points: "Difficulty concentrating on homework. Emotional volatility - meltdowns over small frustrations. Difficulty falling asleep. Impulsivity. Difficulty in school relationships.",
    what_they_tried: "Reduced sugar, omega-3 supplements, strict routine, occupational therapy, fidget tools.",
    what_they_want: "For her son to be able to focus enough to succeed in school. For bedtime to not be a battle. For him to have friendships. For her to stop feeling like a failing mother.",
    objections: `"Is it safe for children?" "Will it interact with anything?" "Will it actually work or am I grasping at straws?"`,
    conversion_triggers: "Testimonials from other mothers of ADHD children (these exist abundantly in the repeat purchase data). The natural ingredient positioning. Dosage guidance for children. Reassurance it's not a medication.",
    messaging_notes: `"Les devoirs sans crise." "Une solution naturelle pour l'aider à se concentrer." "Mon fils est plus serein - sans médicament."`,
    compliance_note: "TDAH (ADHD) cannot be mentioned in advertising. Messaging must focus on concentration, calm, focus without referencing the condition.",
    sort_order: 4,
  },
];

// =============================================
// AIRTABLE DATA — Awareness Levels (5 records)
// =============================================

const awarenessLevels = [
  {
    airtable_record_id: "recsbx9g4v1MSdshe",
    level: 1,
    name: "Unaware",
    description: "The customer does not know she has a problem that can be solved. She may not even have language for what she's experiencing.",
    script_objective: "Educate and intrigue. Make her recognise herself.",
    hook_style: "Questions that provoke self-reflection. Educational content framed as discovery.",
    examples: `"D'un point de vue neuroscientifique, qu'est-ce que le stress fait reellement dans le cerveau?" "Pourquoi les personnes sous pression prolongee disent souvent: 'Je ne panique pas - je ne me sens juste plus calme'?"`,
    tone: "Documentary. Curious. Scientific but accessible.",
    warning: "Pure unaware content can feel too academic. Balance education with emotional resonance.",
  },
  {
    airtable_record_id: "recENSjxsHAJLp9zO",
    level: 2,
    name: "Problem Aware",
    description: "The customer knows something is wrong. She feels the exhaustion, the irritability, the sleeplessness. She does not yet know there is a solution.",
    script_objective: "Validate her experience. Show her she is not alone. Name the problem.",
    hook_style: `Symptom recognition. "This is what's happening to you."`,
    examples: `"Epuisee, irritable, l'esprit qui ne s'arrete jamais. Voila ce que le stress fait a ton cerveau." "Je ne ressentais plus rien. Ni joie, ni stress. Juste du vide. C'etait un signal d'alarme."`,
    tone: "Empathetic. First-person. Relatable.",
    warning: null,
  },
  {
    airtable_record_id: "rec5fdyGJForUBwlI",
    level: 3,
    name: "Solution Aware",
    description: "The customer knows solutions exist. She has tried some. She may know about saffron or supplements generally. She does not yet know about Naali specifically.",
    script_objective: "Differentiate Naali. Explain why this solution is different from what she's tried.",
    hook_style: `Comparison. "Why this works when others didn't."`,
    examples: `"Vous avez essaye le magnesium. Voici pourquoi ca n'a pas suffi." "La difference entre le safran en gelule et le safran Naali."`,
    tone: "Authoritative. Educational. Confident.",
    warning: null,
  },
  {
    airtable_record_id: "recpZkYryikNgAwVy",
    level: 4,
    name: "Product Aware",
    description: "The customer knows Naali exists. She has seen ads, visited the site, maybe added to cart. She has not purchased.",
    script_objective: "Overcome final objections. Build urgency. Provide proof",
    hook_style: "Objection handling. Social proof. Offer.",
    examples: `"Vous hesitez encore? Voici ce que disent les 50,000 femmes qui ont essaye." "La raison pour laquelle j'ai attendu 3 mois avant d'acheter - et pourquoi je regrette."`,
    tone: "Direct. Proof-heavy. Action-oriented.",
    warning: null,
  },
  {
    airtable_record_id: "recIQxWV3jYG84Tfg",
    level: 5,
    name: "Most Aware",
    description: "The customer has purchased before. She knows the product works. She needs a reason to reorder now.",
    script_objective: "Remind. Reward loyalty. Introduce new products.",
    hook_style: "Retention. Cross-sell. Subscription value.",
    examples: `"Votre cure se termine bientot - voici votre offre fidelite." "Vous aimez l'Anti-Stress? Decouvrez ce que le Magnesium peut ajouter."`,
    tone: "Familiar. Appreciative. Exclusive",
    warning: null,
  },
];

// =============================================
// AIRTABLE DATA — Hook Variations (10 records)
// =============================================

const hookVariations = [
  {
    airtable_record_id: "recoZYtpDGMwS9Ylf",
    hook_title: "La Question du 3h du Matin",
    hook_type: "Question",
    hook_text: "Tu te reveilles encore a 3h du matin, l'esprit qui ne s'arrete pas ?",
    visual_description: "Gros plan sur ecran de telephone affichant 3h12 dans le noir. Lumiere bleue froide eclaire partiellement une paire d'yeux grands ouverts sur un oreiller. Aucun mouvement. Immobilite epuisee.",
    why_it_works: "Hyper-specific time anchor ('3am') creates instant recognition for the target persona.",
    platform_best_fit: "Meta",
    estimated_stop_rate: "High",
    // Will link to script later via airtable_record_id mapping
    script_airtable_id: null,
  },
  {
    airtable_record_id: "rec9trJsE5tHJhFUh",
    hook_title: "La Salle De Bain",
    hook_type: "Emotional",
    hook_text: "J'ai pleure dans la salle de bain apres avoir crie sur mes enfants. Encore.",
    visual_description: "Salle de bain ordinaire. Femme assise sur le bord de la baignoire ou adossee a la porte fermee.",
    why_it_works: "This hook names the deepest, most private shame of the Naali persona.",
    platform_best_fit: "Meta",
    estimated_stop_rate: "High",
    script_airtable_id: null,
  },
  {
    airtable_record_id: "recFGF2MHZF6LFhqW",
    hook_title: "Le Fait Qui Frappe",
    hook_type: "Fact",
    hook_text: "3h du matin -- l'heure ou les femmes epuisees ruminent le plus.",
    visual_description: "Fond noir total. Texte blanc apparait en fondu progressif, style notification d'application ou notes iOS.",
    why_it_works: "The specificity of '3am' combined with the word 'ruminent'.",
    platform_best_fit: "Meta",
    estimated_stop_rate: "High",
    script_airtable_id: null,
  },
  {
    airtable_record_id: "recwMSCULJwnoxs2Q",
    hook_title: "Pas De Reve A Vendre",
    hook_type: "Pattern Interrupt",
    hook_text: "Je vais pas te vendre du reve. Juste te dire ce qui m'a enfin aidee a dormir.",
    visual_description: "Femme face camera, eclairage naturel non parfait, pas de maquillage ou maquillage minimal.",
    why_it_works: "Directly pre-empts the core objection ('another supplement that won't work') in the first sentence.",
    platform_best_fit: "Universal",
    estimated_stop_rate: "High",
    script_airtable_id: null,
  },
  {
    airtable_record_id: "recsHP9U3zMNnlkiv",
    hook_title: "La Question Que Chaque Nuit te Pose",
    hook_type: "Question",
    hook_text: "Est-ce que vous aussi, vous vous reveillez plusieurs fois par nuit -- trempee, epuisee -- en vous demandant si ca va durer toute votre vie ?",
    visual_description: "Femme allongee dans son lit, les yeux grand ouverts, fixant le plafond dans l'obscurite.",
    why_it_works: "This hook mirrors Nathalie's exact lived experience at the most specific and visceral level.",
    platform_best_fit: "Meta",
    estimated_stop_rate: "High",
    script_airtable_id: null,
  },
  {
    airtable_record_id: "recr0Db0R0ysN3bcf",
    hook_title: "J'avais Honte de Moi-Meme",
    hook_type: "Emotional",
    hook_text: "J'avais tellement honte de ces crises de colere. Devant mes eleves. Devant ma famille. Je me demandais si j'etais en train de perdre la tete.",
    visual_description: "Gros plan visage de femme, regard legerement baisse au debut, puis qui remonte vers la camera.",
    why_it_works: "Shame is Nathalie's most private and least-spoken emotion around menopause.",
    platform_best_fit: "Meta",
    estimated_stop_rate: "High",
    script_airtable_id: null,
  },
  {
    airtable_record_id: "recNx8av2iNHveV2a",
    hook_title: "3h17. Encore.",
    hook_type: "Pattern Interrupt",
    hook_text: "3h17 du matin. Quatrieme reveil. Draps trempes. Et demain, j'ai trente eleves qui m'attendent.",
    visual_description: "Ouverture sur un plan extremement serre du cadran d'un reveil numerique affichant 3h17.",
    why_it_works: "Hyper-specificity is the conversion mechanism here. '3h17' (not '3h') and 'quatrieme reveil'.",
    platform_best_fit: "TikTok",
    estimated_stop_rate: "High",
    script_airtable_id: null,
  },
  {
    airtable_record_id: "recHpkV64JpuDaq8b",
    hook_title: "La Plante Des Millenaires",
    hook_type: "Curiosity Gap",
    hook_text: "Une plante utilisee depuis des millenaires... et mes nuits ont enfin change.",
    visual_description: "Gros plan macro sur des filaments de safran dores sur fond sombre.",
    why_it_works: "Creates a two-part curiosity engine: the ancient ingredient.",
    platform_best_fit: "Meta",
    estimated_stop_rate: "Medium",
    script_airtable_id: null,
  },
  {
    airtable_record_id: "rec6tnJclSy9Ddgqv",
    hook_title: "Ce Qu'on Ne Dit Jamais aux Femmes en Menopause",
    hook_type: "Curiosity Gap",
    hook_text: "Ce que personne ne m'a jamais dit sur la menopause -- et que j'aurais eu besoin d'entendre bien plus tot.",
    visual_description: "Femme qui se penche legerement vers la camera, comme si elle allait confier un secret.",
    why_it_works: "The curiosity gap is classic but powerful.",
    platform_best_fit: "Meta",
    estimated_stop_rate: "Medium",
    script_airtable_id: null,
  },
  {
    airtable_record_id: "recaOP8MRNiNRzmzr",
    hook_title: "La Verite Que Personne ne Dit",
    hook_type: "Fact",
    hook_text: "Des milliers de femmes en menopause pensent qu'elles doivent juste accepter les nuits sans sommeil et les sautes d'humeur. Ce n'est pas une fatalite.",
    visual_description: "Format Notes app ou texte sur fond blanc uni.",
    why_it_works: "This hook attacks the resignation belief that Nathalie holds most strongly.",
    platform_best_fit: "Native",
    estimated_stop_rate: "Medium",
    script_airtable_id: null,
  },
];

// =============================================
// AIRTABLE DATA — Content Briefs (2 records)
// =============================================

const contentBriefs = [
  {
    airtable_record_id: "recDy8fNWsPhJM7x1",
    brief_name: "Marie UGC 30s - Sleep Problems",
    content_type: "UGC",
    scenario_description: "Une femme epuisee raconte comment elle se reveillait chaque nuit a 3h du matin, l'esprit qui tourne en boucle. Elle decouvre une solution naturelle au safran et retrouve enfin des nuits completes.",
    target_objection: "Another supplement won't work",
    angle_direction: "Lead with the 3am rumination moment every exhausted mother knows. Build empathy, then pivot to saffron as the natural ingredient that changed everything.",
    proof_assets: ["Reviews wall", "Raw UGC testimonial"],
    persona_name: "Marie - The Overwhelmed Mother",
    awareness_level_name: "Problem Aware",
    platform: "Meta",
    duration: "30s",
    language: "FR",
    tone_override: null,
    notes: null,
    status: "Complete",
  },
  {
    airtable_record_id: "recVITNMG7rysPGHA",
    brief_name: "Test karim",
    content_type: "UGC",
    scenario_description: null,
    target_objection: null,
    angle_direction: null,
    proof_assets: null,
    persona_name: "Nathalie - The Menopause Sufferer",
    awareness_level_name: "Problem Aware",
    platform: "Meta",
    duration: "45s",
    language: "FR",
    tone_override: null,
    notes: null,
    status: "Complete",
  },
];

// =============================================
// AIRTABLE DATA — Video Brief Requests (1 record)
// =============================================

const videoBriefRequests = [
  {
    airtable_record_id: "recoGrjmuLSx6H3IY",
    brief_name: "TEST - Marie UGC 30s Sommeil",
    content_type: "Problem-Solution",
    scenario_description: "Marie se reveille a 3h du matin, incapable de dormir. Son reveil affiche 3:00. Elle se tourne, regarde son telephone, voit les heures passer. Le matin, elle est epuisee avec ses enfants. Elle decouvre Naali, commence sa routine du soir. Quelques semaines plus tard, elle dort paisiblement. Le reveil sonne a 7h, elle se reveille naturellement, sourit a ses enfants.",
    target_objection: "Skepticism",
    angle_direction: "Reconnaissance du probleme -- elle pensait que c'etait normal d'etre epuisee, mais ce n'est pas une fatalite",
    persona: "Marie",
    awareness_level: "Problem Aware",
    platform: "Meta",
    duration: "30s",
    language: "FR",
    production_constraints: "Budget moyen, tournage en interieur (appartement parisien), une actrice principale, pas de figurants",
    proof_assets: ["Customer Reviews", "50K+ Customers"],
    notes: "Tonalite tres naturelle, type temoignage UGC filme au telephone. Pas de voix-off professionnelle -- la femme parle directement a la camera.",
    status: "Complete",
  },
];

// =============================================
// MIGRATION LOGIC
// =============================================

async function main() {
  console.log("🚀 Starting Airtable → Supabase migration...\n");

  // Step 1: Clear existing seed data
  console.log("Step 1: Clearing existing seed data...");
  await sql`DELETE FROM hook_variations`;
  await sql`DELETE FROM generated_scripts`;
  await sql`DELETE FROM content_briefs`;
  await sql`DELETE FROM winners`;
  await sql`DELETE FROM awareness_levels`;
  await sql`DELETE FROM personas`;
  await sql`DELETE FROM brand_intelligence`;
  await sql`DELETE FROM video_brief_requests`;
  await sql`DELETE FROM generated_video_briefs`;
  // Keep script_reviews, users, app_config, activity_log
  console.log("  ✓ Cleared\n");

  // Step 2: Personas
  console.log("Step 2: Inserting personas...");
  for (const p of personas) {
    await sql`
      INSERT INTO personas (name, label, demographics, situation, pain_points, what_they_tried, what_they_want, objections, conversion_triggers, messaging_notes, compliance_note, sort_order, airtable_record_id)
      VALUES (${p.name}, ${p.label}, ${p.demographics}, ${p.situation}, ${p.pain_points}, ${p.what_they_tried}, ${p.what_they_want}, ${p.objections}, ${p.conversion_triggers}, ${p.messaging_notes}, ${p.compliance_note}, ${p.sort_order}, ${p.airtable_record_id})
    `;
  }
  console.log(`  ✓ ${personas.length} personas\n`);

  // Step 3: Awareness Levels
  console.log("Step 3: Inserting awareness levels...");
  for (const a of awarenessLevels) {
    await sql`
      INSERT INTO awareness_levels (level, name, description, script_objective, hook_style, examples, tone, warning, airtable_record_id)
      VALUES (${a.level}, ${a.name}, ${a.description}, ${a.script_objective}, ${a.hook_style}, ${a.examples}, ${a.tone}, ${a.warning}, ${a.airtable_record_id})
    `;
  }
  console.log(`  ✓ ${awarenessLevels.length} awareness levels\n`);

  // Step 4: Content Briefs (need persona_id and awareness_level_id lookups)
  console.log("Step 4: Inserting content briefs...");
  for (const b of contentBriefs) {
    // Look up persona_id by name
    const [persona] = await sql`SELECT id FROM personas WHERE name = ${b.persona_name}`;
    // Look up awareness_level by name
    const [awareness] = await sql`SELECT id FROM awareness_levels WHERE name = ${b.awareness_level_name}`;

    await sql`
      INSERT INTO content_briefs (brief_name, content_type, scenario_description, target_objection, angle_direction, proof_assets, persona_id, awareness_level_id, platform, duration, language, tone_override, notes, status, airtable_record_id)
      VALUES (${b.brief_name}, ${b.content_type}, ${b.scenario_description}, ${b.target_objection}, ${b.angle_direction}, ${b.proof_assets ? JSON.stringify(b.proof_assets) : null}::jsonb, ${persona?.id || null}, ${awareness?.id || null}, ${b.platform}, ${b.duration}, ${b.language}, ${b.tone_override}, ${b.notes}, ${b.status?.toLowerCase() || 'new'}, ${b.airtable_record_id})
    `;
  }
  console.log(`  ✓ ${contentBriefs.length} content briefs\n`);

  // Step 5: Hook Variations (no script link for now — scripts will be added later)
  // We need to insert a placeholder generated_script to link hooks to
  // For now, insert hooks without script_id (make it nullable first)
  console.log("Step 5: Inserting hook variations (unlinked for now)...");

  // Temporarily allow null script_id
  await sql`ALTER TABLE hook_variations ALTER COLUMN script_id DROP NOT NULL`;

  for (const h of hookVariations) {
    await sql`
      INSERT INTO hook_variations (hook_title, hook_type, hook_text, visual_description, why_it_works, platform_best_fit, estimated_stop_rate, airtable_record_id, script_id)
      VALUES (${h.hook_title}, ${h.hook_type}, ${h.hook_text}, ${h.visual_description}, ${h.why_it_works}, ${h.platform_best_fit}, ${h.estimated_stop_rate}, ${h.airtable_record_id}, NULL)
    `;
  }
  console.log(`  ✓ ${hookVariations.length} hook variations\n`);

  // Step 6: Video Brief Requests
  console.log("Step 6: Inserting video brief requests...");
  for (const v of videoBriefRequests) {
    await sql`
      INSERT INTO video_brief_requests (brief_name, content_type, scenario_description, target_objection, angle_direction, persona, awareness_level, platform, duration, language, production_constraints, proof_assets, notes, status, airtable_record_id)
      VALUES (${v.brief_name}, ${v.content_type}, ${v.scenario_description}, ${v.target_objection}, ${v.angle_direction}, ${v.persona}, ${v.awareness_level}, ${v.platform}, ${v.duration}, ${v.language}, ${v.production_constraints}, ${v.proof_assets ? JSON.stringify(v.proof_assets) : null}::jsonb, ${v.notes}, ${v.status?.toLowerCase() || 'new'}, ${v.airtable_record_id})
    `;
  }
  console.log(`  ✓ ${videoBriefRequests.length} video brief requests\n`);

  // Step 7: Script Reviews (from Base 1)
  console.log("Step 7: Script reviews will be migrated separately (need full text data)...\n");

  // Summary
  console.log("=".repeat(50));
  console.log("Migration Phase 1 complete!");
  console.log("=".repeat(50));
  console.log("\nInserted:");
  console.log(`  - ${personas.length} personas`);
  console.log(`  - ${awarenessLevels.length} awareness levels`);
  console.log(`  - ${contentBriefs.length} content briefs`);
  console.log(`  - ${hookVariations.length} hook variations`);
  console.log(`  - ${videoBriefRequests.length} video brief requests`);
  console.log("\nPending (Phase 2 — need full text from background fetch):");
  console.log("  - 1 brand intelligence record");
  console.log("  - 2 generated scripts (with full text)");
  console.log("  - 1 generated video brief (with full text)");
  console.log("  - 4 script reviews (from Base 1)");

  // Verify counts
  console.log("\n--- Verification ---");
  const counts = await sql`
    SELECT
      (SELECT count(*) FROM personas) as personas,
      (SELECT count(*) FROM awareness_levels) as awareness_levels,
      (SELECT count(*) FROM content_briefs) as content_briefs,
      (SELECT count(*) FROM hook_variations) as hook_variations,
      (SELECT count(*) FROM video_brief_requests) as video_brief_requests
  `;
  console.log("Supabase counts:", counts[0]);

  await sql.end();
}

main().catch(async (e) => {
  console.error("Migration failed:", e);
  await sql.end();
  process.exit(1);
});
