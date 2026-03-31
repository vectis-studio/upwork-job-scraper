/**
 * VECTIS STUDIO — Upwork Job Scraper
 * n8n Code Node: Keyword Filter + Telegram Formatter
 *
 * Filters Apify job results using a two-tier keyword system and formats
 * matching jobs into Telegram messages in batches of 5.
 *
 * High-signal keywords: one match is enough to qualify a job
 * Supporting keywords: requires 2+ matches to qualify
 * Title exclusions: disqualify jobs before keyword matching
 */

const jobs = $input.all();

// High-signal keywords -- a single match is enough to qualify
const highSignalKeywords = [
  'openclaw', 'claude api', 'anthropic', 'gohighlevel', 'go high level',
  'highlevel', 'high level crm', 'n8n', 'ai agent', 'agentic',
  'voice agent', 'conversational ai'
];

// Supporting keywords -- require 2+ matches to qualify
const supportingKeywords = [
  'make.com', 'zapier', 'automation', 'workflow automation', 'ai integration',
  'crm automation', 'lead automation', 'chatbot', 'ai workflow',
  'business automation', 'process automation', 'twilio', 'airtable',
  'claude', 'openai', 'llm', 'api integration', 'webhook'
];

// Keywords that disqualify a job if they appear in the title
const titleExclusions = [
  'wordpress', 'shopify', 'react', 'nextjs', 'next.js', 'nestjs',
  'golang', 'flutter', 'swift', 'android', 'ios', 'unity',
  'graphic design', 'video editor', 'seo writer', 'copywriter',
  'moodle', 'odoo', 'dynamics 365'
];

const filtered = jobs.filter(job => {
  const score = job.json.customJobScore || 0;
  const paymentVerified = job.json.client?.paymentMethodVerified || false;
  if (score < 3.5 || !paymentVerified) return false;

  const title = (job.json.title || '').toLowerCase();
  const text = [
    title,
    job.json.description || '',
    ...(job.json.skills || [])
  ].join(' ').toLowerCase();

  // Disqualify if title contains exclusion keywords
  if (titleExclusions.some(kw => title.includes(kw.toLowerCase()))) return false;

  // Pass if any high-signal keyword matches
  if (highSignalKeywords.some(kw => text.includes(kw.toLowerCase()))) return true;

  // Pass if 2+ supporting keywords match
  const supportingMatches = supportingKeywords.filter(kw => text.includes(kw.toLowerCase()));
  return supportingMatches.length >= 2;
});

if (filtered.length === 0) {
  return [{ json: { message: `🔍 Upwork Jobs — ${new Date().toLocaleDateString('en-US', {month:'short', day:'numeric'})}\nNo relevant jobs found today.` } }];
}

const lines = filtered.map(job => {
  const title = job.json.title || 'No title';
  const link = job.json.externalLink || '';
  const fixed = job.json.budget?.fixedBudget;
  const hourlyMin = job.json.budget?.hourlyRate?.min;
  const hourlyMax = job.json.budget?.hourlyRate?.max;
  const skills = (job.json.skills || []).slice(0, 3).join(', ');
  const score = job.json.customJobScore;
  const spent = job.json.client?.stats?.totalSpent || 0;

  let budget = 'Budget not listed';
  if (fixed && fixed > 10) budget = `$${fixed} fixed`;
  else if (hourlyMin && hourlyMax) budget = `$${hourlyMin}-$${hourlyMax}/hr`;
  else if (hourlyMin) budget = `$${hourlyMin}+/hr`;

  return `📌 ${title}\n💰 ${budget} | ⭐ ${score}\n🏷 ${skills}\n💼 $${Math.round(spent).toLocaleString()} spent\n🔗 ${link}`;
});

const chunkSize = 5;
const chunks = [];
for (let i = 0; i < lines.length; i += chunkSize) {
  chunks.push(lines.slice(i, i + chunkSize));
}

const date = new Date().toLocaleDateString('en-US', {month:'short', day:'numeric'});

return chunks.map((chunk, i) => ({
  json: {
    message: `🔍 Upwork Jobs — ${date} (${i + 1}/${chunks.length})\n\n` + chunk.join('\n\n')
  }
}));
