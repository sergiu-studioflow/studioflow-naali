import postgres from "postgres";

const sql = postgres(
  "postgresql://postgres.caxsquldkzmcabjhjfqh:StudioFlow2026@aws-1-eu-west-1.pooler.supabase.com:6543/postgres",
  { max: 1, prepare: false }
);

async function main() {
  console.log("Seeding Naali data...\n");

  // 1. App Config
  console.log("  Seeding app_config...");
  await sql`
    INSERT INTO app_config (brand_name, brand_color, portal_title, features, workflows, content_types, platforms, durations, languages)
    VALUES (
      'Naali',
      '#2D5A3D',
      'Naali Creative Studio',
      '{"script_generation": true, "script_review": true, "brand_intel_editing": true, "winners_library": true, "hook_variations": true}'::jsonb,
      '{"script_generation": {"webhook_path": "generate-naali-script", "n8n_base_url": "https://studio-flow.app.n8n.cloud"}}'::jsonb,
      '["UGC", "Founder-led", "Testimonial", "Podcast/Interview", "Native", "VSL"]'::jsonb,
      '["Meta", "TikTok", "Instagram", "All Platforms"]'::jsonb,
      '["15s", "30s", "45s", "60s"]'::jsonb,
      '["FR", "UK"]'::jsonb
    )
    ON CONFLICT DO NOTHING
  `;
  console.log("  ✓ app_config");

  // 2. Personas
  console.log("  Seeding personas...");

  await sql`
    INSERT INTO personas (name, label, demographics, situation, pain_points, what_they_tried, what_they_want, objections, conversion_triggers, messaging_notes, sort_order)
    VALUES
    (
      'Marie',
      'Overwhelmed Mother',
      '38, married, 2 children (6 and 9), part-time HR, suburban Lyon',
      'Returned to work after maternity leave, never recovered equilibrium. Project manager of household + job. Exhausted but can''t stop.',
      'Insomnia (3am wake-ups), weight gain, snaps at kids, hair loss, exhausted but can''t sleep, brain fog',
      'Meditation app (abandoned after 3 days), herbal tea, GP visit (refused antidepressants), spa weekend (temporary relief)',
      'Feel like herself again, patience with children, rested mornings, stop dreading each day',
      '"Another supplement won''t work", expensive for household budget, no time to research if it''s legitimate',
      'Testimonial from similar mother, M6 TV appearance ("Qui veut être mon associé"), first-purchase discount, natural positioning',
      'Key phrases: "Retrouver votre calme avec vos enfants", "Vous méritez une nuit complète", "Naturel, sans médicament"',
      1
    ),
    (
      'Sophie',
      'High-Performing Professional',
      '44, single, senior manager (consulting), Paris',
      'Built career through relentless work. Now hitting a wall — body breaking down while mind demands more.',
      'Heart palpitations, digestion issues, insomnia before meetings, concentration loss, brain fog, imposter syndrome',
      'Performance coaching, productivity systems, CBD, reduced alcohol, therapy (can''t schedule)',
      'Perform at previous level, stop dreading work, feel sharp and focused, no physical anxiety symptoms',
      '"Supplements are for hippies", not for serious professionals, needs something stronger/clinical',
      'Scientific credibility, founder story (respects entrepreneurs), discreet format, "optimisation" framing',
      'Key phrases: "Pour les femmes qui ne peuvent pas se permettre d''être ralenties", "Retrouvez votre concentration"',
      2
    ),
    (
      'Nathalie',
      'Menopause Sufferer',
      '52, married, adult children, schoolteacher, Toulouse',
      'Perimenopause (3 years) then menopause (1 year). Severity caught her completely unprepared.',
      'Hot flashes 4-5x/night, night sweats, weight gain (8kg in 18 months), mood swings, brain fog, low libido, dryness',
      'HRT (afraid of cancer risk), soy isoflavones, black cohosh, evening primrose oil, magnesium',
      'Sleep through the night, no sweating episodes, emotional stability, recognise herself again',
      '"Another menopause supplement that won''t work", already wasted money on alternatives, "this is for young stressed women not menopausal women"',
      'Testimonials from menopausal women specifically, specific menopause symptom claims, proof of understanding her experience',
      'Key phrases: "Les bouffées de chaleur qui vous réveillent à 3h du matin", "Retrouvez des nuits complètes"',
      3
    ),
    (
      'Céline',
      'Mother of ADHD Child',
      '41, divorced, son (11) diagnosed ADHD, administrative assistant, Bordeaux',
      'Son diagnosed ADHD at 8. Resisted medication due to side effects. Tried everything behavioural. Now exhausted from managing both his needs and her own collapse.',
      'Son: concentration difficulty, emotional volatility, sleep issues, impulsivity, school problems. Céline: burnout from managing it all alone.',
      'Reduced sugar, omega-3, strict routine, occupational therapy, behavioural strategies',
      'Son able to focus for school, bedtime not a 2-hour battle, son having friendships, stop feeling like a failing mother',
      '"Is it safe for children?", "Will it interact with anything?", "Am I just grasping at straws?"',
      'Testimonials from other ADHD mothers, natural ingredient emphasis, child dosage guidance, safety data',
      'Key phrases: "Les devoirs sans crise", "Une solution naturelle pour l''aider à se concentrer", "Sans médicament"',
      4
    )
    ON CONFLICT DO NOTHING
  `;
  console.log("  ✓ personas (4 records)");

  // 3. Awareness Levels
  console.log("  Seeding awareness_levels...");

  await sql`
    INSERT INTO awareness_levels (level, name, description, script_objective, hook_style, creative_guidelines)
    VALUES
    (1, 'Unaware', 'Doesn''t know she has a solvable problem. Lives with exhaustion as normal.', 'Agitate the problem. Make her realise this isn''t normal.', 'Pattern interrupt, shocking statistic, "Is this you?" recognition', 'Lead with symptoms she normalises. Mirror her language. Don''t mention Naali yet.'),
    (2, 'Problem Aware', 'Feels exhaustion, knows something is wrong, but doesn''t know a solution exists.', 'Validate the pain. Introduce that solutions exist.', 'Emotional storytelling, "I was just like you" testimonial, symptom recognition', 'Acknowledge what she''s tried. Show empathy. Hint at a category of solution (natural supplements).'),
    (3, 'Solution Aware', 'Knows supplements/solutions exist, may have tried some, doesn''t know Naali specifically.', 'Differentiate. Why Naali is different from what she''s tried.', 'Comparison, ingredient spotlight, founder credibility', 'Focus on what makes Naali unique: saffron-based, M6 TV appearance, 100K+ customers, specific ingredients.'),
    (4, 'Product Aware', 'Knows Naali exists, hasn''t purchased yet. Needs a push.', 'Overcome final objections. Create urgency.', 'Social proof at scale, limited offers, risk reversal', 'Customer reviews wall, money-back guarantee, first-order discounts, "thousands of women like you" messaging.'),
    (5, 'Most Aware', 'Already a Naali customer. Needs reorder motivation or upsell.', 'Reinforce purchase decision. Drive loyalty and advocacy.', 'Ritual reinforcement, results timeline, community', 'Celebrate her progress. Show what consistent use achieves. Introduce referral or subscription.')
    ON CONFLICT (level) DO NOTHING
  `;
  console.log("  ✓ awareness_levels (5 records)");

  // 4. Brand Intelligence (summary)
  console.log("  Seeding brand_intelligence...");

  await sql`
    INSERT INTO brand_intelligence (title, raw_content, sections)
    VALUES (
      'Naali Brand Intelligence',
      'Naali is a French natural supplement brand focused on women''s wellness — specifically exhaustion, stress, sleep, and emotional balance. Founded by Karim, featured on M6 TV show "Qui veut être mon associé". Core product is saffron-based. Over 100,000 customers. The brand voice is warm but not soft, knowledgeable but not clinical, honest about limitations. Key insight: the customer is not defined by demographics but by a moment of breaking point — she is exhausted, managing everything, and now failing at herself.',
      '{"core_identity": "French natural supplement brand for women''s wellness", "target_audience": "Women 30-55, exhausted, managing career + family, at breaking point", "key_products": "Saffron-based supplements for stress, sleep, emotional balance", "brand_voice": "Warm but not soft, knowledgeable but not clinical, honest about limitations", "compliance": "EU CE 1924/2006 — authorized saffron and vitamin B claims only", "founder": "Karim — M6 TV Qui veut être mon associé", "customer_count": "100,000+", "key_insight": "Word fatiguée appears 368 times in survey data — double any other descriptor"}'::jsonb
    )
    ON CONFLICT DO NOTHING
  `;
  console.log("  ✓ brand_intelligence");

  console.log("\n✅ Naali seed complete!");
  await sql.end();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await sql.end();
  process.exit(1);
});
