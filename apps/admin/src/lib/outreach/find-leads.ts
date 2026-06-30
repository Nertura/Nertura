/**
 * Web search → lead extraction.
 * Uses SerpAPI when SERPAPI_KEY is set; otherwise DuckDuckGo HTML lite.
 */

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

export interface SearchLeadCandidate {
  name: string | null;
  company: string;
  sector: string;
  email: string;
  source: string;
}

function cleanCompany(title: string): string {
  return title
    .replace(/\s*[-|–—].*$/, '')
    .replace(/\s*\|.*$/, '')
    .trim()
    .slice(0, 120);
}

function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_RE) ?? [];
  return [...new Set(matches.map((e) => e.toLowerCase()))].filter(
    (e) => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.includes('example.com')
  );
}

async function searchSerpApi(query: string): Promise<Array<{ title: string; snippet: string; link: string }>> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];

  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', query);
  url.searchParams.set('api_key', key);
  url.searchParams.set('num', '15');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);

  const json = (await res.json()) as {
    organic_results?: Array<{ title?: string; snippet?: string; link?: string }>;
  };

  return (json.organic_results ?? []).map((r) => ({
    title: r.title ?? '',
    snippet: r.snippet ?? '',
    link: r.link ?? '',
  }));
}

async function searchDuckDuckGo(query: string): Promise<Array<{ title: string; snippet: string; link: string }>> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NerturaOutreachBot/1.0 (+https://nertura.com)',
    },
  });

  if (!res.ok) throw new Error(`DuckDuckGo search failed: ${res.status}`);

  const html = await res.text();
  const results: Array<{ title: string; snippet: string; link: string }> = [];

  const resultBlocks = html.split('result__body');
  for (const block of resultBlocks.slice(1, 16)) {
    const titleMatch = block.match(/result__a[^>]*>([^<]+)</);
    const snippetMatch = block.match(/result__snippet[^>]*>([^<]+)</);
    const linkMatch = block.match(/uddg=([^&"]+)/);
    if (titleMatch) {
      results.push({
        title: titleMatch[1]!.trim(),
        snippet: snippetMatch?.[1]?.trim() ?? '',
        link: linkMatch ? decodeURIComponent(linkMatch[1]!) : '',
      });
    }
  }

  return results;
}

export async function findLeadsFromWebSearch(sector: string): Promise<SearchLeadCandidate[]> {
  const query =
    process.env.OUTREACH_SEARCH_QUERY?.replace('{sector}', sector) ??
    `${sector} tarım firması iletişim e-posta Türkiye`;

  const serpResults = await searchSerpApi(query);
  const results = serpResults.length ? serpResults : await searchDuckDuckGo(query);

  const candidates: SearchLeadCandidate[] = [];
  const seenEmails = new Set<string>();

  for (const r of results) {
    const blob = `${r.title} ${r.snippet} ${r.link}`;
    const emails = extractEmails(blob);

    for (const email of emails) {
      if (seenEmails.has(email)) continue;
      seenEmails.add(email);
      candidates.push({
        name: null,
        company: cleanCompany(r.title) || sector,
        sector,
        email,
        source: process.env.SERPAPI_KEY ? 'serpapi' : 'duckduckgo',
      });
    }
  }

  return candidates;
}
