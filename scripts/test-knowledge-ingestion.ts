/**
 * Safe smoke test for knowledge ingestion utilities (no DB writes).
 * Run: pnpm test:knowledge-ingestion
 */
import { computeDuplicateHash, normalizeIngestionText } from '@nertura/knowledge-ingestion';
import { searchAgrovocConcepts } from '@nertura/knowledge-ingestion';

async function main() {
  const raw = '  Wheat   rust\r\n\r\n\r\nSymptoms on leaves.  ';
  const normalized = normalizeIngestionText(raw);
  console.assert(normalized.includes('Wheat rust'), 'normalizeIngestionText failed');

  const hash1 = computeDuplicateHash({
    title: 'Wheat rust',
    sourceUrl: 'https://example.com/a',
    normalizedText: normalized,
  });
  const hash2 = computeDuplicateHash({
    title: 'Wheat rust',
    sourceUrl: 'https://example.com/a',
    normalizedText: normalized,
  });
  console.assert(hash1 === hash2, 'duplicate hash must be stable');
  console.log('✓ hash + normalize');

  if (process.env.SKIP_AGROVOC === '1') {
    console.log('⊘ AGROVOC skipped (SKIP_AGROVOC=1)');
    return;
  }

  try {
    const concepts = await searchAgrovocConcepts('wheat', 2);
    console.log(`✓ AGROVOC returned ${concepts.length} concept(s)`);
    if (concepts[0]) {
      console.log(`  sample: ${concepts[0]}`);
    }
  } catch (err) {
    console.warn('⚠ AGROVOC lookup failed (network?) —', err instanceof Error ? err.message : err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
