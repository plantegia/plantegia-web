/**
 * Content Generation Script for Plantegia Marketing
 *
 * Usage:
 *   npx ts-node scripts/generate-content.ts --keyword "perpetual harvest" --lang en
 *
 * Environment:
 *   OPENROUTER_API_KEY - Your OpenRouter API key
 *
 * This script:
 * 1. Selects a keyword from keywords.json (or uses provided keyword)
 * 2. Generates an SEO-optimized article using AI
 * 3. Saves the article as MDX in marketing/src/content/blog/
 * 4. Updates keywords.json with the published status
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
interface Keyword {
  keyword: string;
  volume: string;
  competition: string;
  priority: number;
  status: 'pending' | 'published' | 'tool';
  slug: string | null;
  lang: string[];
}

interface KeywordsData {
  keywords: Keyword[];
  categories: string[];
}

interface ArticleData {
  title: string;
  description: string;
  slug: string;
  keywords: string[];
  content: string;
}

// Config
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const KEYWORDS_PATH = path.join(__dirname, 'keywords.json');
const CONTENT_PATH = path.join(__dirname, '../marketing/src/content/blog');

// Load keywords
function loadKeywords(): KeywordsData {
  const data = fs.readFileSync(KEYWORDS_PATH, 'utf-8');
  return JSON.parse(data);
}

// Save keywords
function saveKeywords(data: KeywordsData): void {
  fs.writeFileSync(KEYWORDS_PATH, JSON.stringify(data, null, 2));
}

// Select next keyword to write about
function selectNextKeyword(data: KeywordsData, lang: string): Keyword | null {
  const pending = data.keywords
    .filter((k) => k.status === 'pending' && k.lang.includes(lang))
    .sort((a, b) => b.priority - a.priority);

  return pending[0] || null;
}

// Generate article using OpenRouter
async function generateArticle(
  keyword: string,
  lang: string,
  apiKey: string
): Promise<ArticleData> {
  const systemPrompt = `You are an expert content writer for Plantegia, a visual planning tool for indoor growers.
Write SEO-optimized blog posts about cannabis growing, perpetual harvest, and multi-tent setups.

Guidelines:
- Write in ${lang === 'de' ? 'German' : 'English'}
- Use markdown formatting with H2 and H3 headings
- Include practical examples and calculations
- Reference the Plantegia app as a planning solution (soft CTA)
- Target the keyword naturally in title, headings, and content
- Include a FAQ section at the end with 3-5 questions
- Word count: 1500-2500 words
- Tone: Professional, practical, helpful

Output format (JSON):
{
  "title": "SEO-optimized title including keyword",
  "description": "150-160 char meta description with keyword",
  "slug": "url-friendly-slug",
  "keywords": ["primary keyword", "secondary keyword 1", "secondary keyword 2"],
  "content": "Full markdown article content"
}`;

  const userPrompt = `Write a comprehensive blog post targeting the keyword: "${keyword}"

The article should help growers understand and implement the concept. Include:
1. Clear explanation of the concept
2. Step-by-step instructions or calculations
3. Common mistakes to avoid
4. Practical tips
5. How Plantegia can help (subtle mention)
6. FAQ section

Return ONLY valid JSON matching the format above.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://plantegia.com',
      'X-Title': 'Plantegia Content Generator',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content in API response');
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from response');
  }

  return JSON.parse(jsonMatch[0]);
}

// Create MDX file
function createMdxFile(article: ArticleData, lang: string): string {
  const frontmatter = `---
title: "${article.title}"
description: "${article.description}"
pubDate: ${new Date().toISOString().split('T')[0]}
keywords:
${article.keywords.map((k) => `  - ${k}`).join('\n')}
lang: ${lang}
category: guides
---

`;

  return frontmatter + article.content;
}

// Save article
function saveArticle(article: ArticleData, lang: string): string {
  const dirPath = path.join(CONTENT_PATH, lang);
  const filePath = path.join(dirPath, `${article.slug}.mdx`);

  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const mdxContent = createMdxFile(article, lang);
  fs.writeFileSync(filePath, mdxContent);

  return filePath;
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const keywordArg = args.find((a) => a.startsWith('--keyword='))?.split('=')[1];
  const langArg = args.find((a) => a.startsWith('--lang='))?.split('=')[1] || 'en';
  const dryRun = args.includes('--dry-run');

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey && !dryRun) {
    console.error('Error: OPENROUTER_API_KEY environment variable required');
    process.exit(1);
  }

  // Load keywords
  const keywordsData = loadKeywords();

  // Select keyword
  let targetKeyword: string;
  if (keywordArg) {
    targetKeyword = keywordArg;
  } else {
    const nextKeyword = selectNextKeyword(keywordsData, langArg);
    if (!nextKeyword) {
      console.log('No pending keywords found for language:', langArg);
      process.exit(0);
    }
    targetKeyword = nextKeyword.keyword;
  }

  console.log(`Generating article for keyword: "${targetKeyword}" (${langArg})`);

  if (dryRun) {
    console.log('Dry run - would generate article for:', targetKeyword);
    process.exit(0);
  }

  try {
    // Generate article
    const article = await generateArticle(targetKeyword, langArg, apiKey!);
    console.log(`Generated article: ${article.title}`);

    // Save article
    const filePath = saveArticle(article, langArg);
    console.log(`Saved to: ${filePath}`);

    // Update keywords.json
    const keywordEntry = keywordsData.keywords.find(
      (k) => k.keyword.toLowerCase() === targetKeyword.toLowerCase()
    );
    if (keywordEntry) {
      keywordEntry.status = 'published';
      keywordEntry.slug = article.slug;
      saveKeywords(keywordsData);
      console.log('Updated keywords.json');
    }

    console.log('Done!');
  } catch (error) {
    console.error('Error generating content:', error);
    process.exit(1);
  }
}

main();
