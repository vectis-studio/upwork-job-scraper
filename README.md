# upwork-job-scraper

An n8n workflow that scrapes Upwork job listings daily via Apify and delivers matching jobs to Telegram. Built for Vectis Studio to surface relevant automation and AI consulting opportunities each morning without manually checking Upwork.

## What It Does

- Runs on a daily schedule trigger at 7:00 AM CT
- Pulls job listings from Upwork via the Apify upwork-vibe actor
- Filters jobs using a two-tier keyword system
- Sends matching jobs to a Telegram chat in batches of 5

## Tech Stack

- n8n (workflow automation)
- Apify (upwork-vibe actor, ~$0.003 per job)
- Telegram Bot API

## Keyword Filter Logic

Jobs pass the filter using one of two paths:

**High-signal keywords** — a single match is enough to pass:
- openclaw, claude api, anthropic, gohighlevel, n8n, ai agent, agentic, voice agent

**Supporting keywords** — requires 2 or more matches:
- make.com, zapier, automation, twilio, airtable, openai, llm, webhook, and others

**Title exclusions** — jobs are filtered out before keyword matching if the title contains:
- wordpress, shopify, react, nextjs, golang, flutter, graphic design, video editor, moodle, odoo

## Apify Categories Scraped

- AI Apps and Integration
- ERP and CRM Software
- Web Development
- Scripts and Utilities

## Output Format

Each matching job is sent to Telegram as a formatted message including:

- Job title
- Budget or hourly rate
- Posted date
- Job URL

Jobs are sent in batches of 5 to avoid Telegram rate limits.

## Setup

1. Import the workflow JSON into your n8n instance
2. Add your Apify API token as a credential in n8n
3. Add your Telegram bot token and chat ID
4. Set the schedule trigger to your preferred time
5. Activate the workflow

## Notes

- The Apify upwork-vibe actor costs approximately $0.003 per job returned
- Keyword filter logic lives inside a Code node and can be edited directly in n8n
- Title exclusions run before keyword matching to reduce unnecessary processing
