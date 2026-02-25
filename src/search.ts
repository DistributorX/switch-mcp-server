/**
 * Semantic search using local embeddings via Transformers.js.
 * Generates embeddings for document chunks, caches them to disk,
 * and performs cosine similarity search at query time.
 */

import fs from "node:fs";
import path from "node:path";
import type { DocChunk } from "./docs.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResult {
  /** Source file relative path */
  source: string;
  /** Section heading */
  heading: string;
  /** Text snippet (truncated) */
  snippet: string;
  /** URI of the source file */
  uri: string;
  /** Cosine similarity score (0-1) */
  score: number;
  /** Content type: reference, patterns, examples, guide, manual */
  contentType: string;
}

interface CacheEntry {
  hash: string;
  embedding: number[];
}

interface CacheData {
  model: string;
  entries: Record<string, CacheEntry>; // key: "source::heading"
}

// ---------------------------------------------------------------------------
// Embedding pipeline (lazy singleton)
// ---------------------------------------------------------------------------

let pipelineInstance: any = null;
const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

async function getEmbedder() {
  if (pipelineInstance) return pipelineInstance;

  // Dynamic import to avoid loading the heavy module until needed
  const { pipeline } = await import("@huggingface/transformers");

  console.error(`Loading embedding model (${MODEL_ID})...`);
  pipelineInstance = await pipeline("feature-extraction", MODEL_ID);
  console.error("Embedding model loaded.");
  return pipelineInstance;
}

/** Embed a single text string. Returns a 384-dim float array. */
async function embedText(text: string): Promise<number[]> {
  const extractor = await getEmbedder();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

/** Embed a batch of texts. Returns array of 384-dim float arrays. */
async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const extractor = await getEmbedder();
  const output = await extractor(texts, { pooling: "mean", normalize: true });
  const vectors: number[][] = output.tolist();
  return vectors;
}

// ---------------------------------------------------------------------------
// Vector math
// ---------------------------------------------------------------------------

/** Dot product of two vectors (cosine similarity when both are L2-normalized). */
function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

// ---------------------------------------------------------------------------
// Embedding cache
// ---------------------------------------------------------------------------

function getCachePath(cacheDir: string): string {
  return path.join(cacheDir, "embeddings.json");
}

function loadCache(cacheDir: string): CacheData | null {
  const cachePath = getCachePath(cacheDir);
  try {
    if (fs.existsSync(cachePath)) {
      const raw = fs.readFileSync(cachePath, "utf-8");
      const data: CacheData = JSON.parse(raw);
      if (data.model === MODEL_ID) return data;
      console.error("Cache model mismatch, will regenerate embeddings.");
    }
  } catch {
    console.error("Cache corrupted, will regenerate embeddings.");
  }
  return null;
}

function saveCache(cacheDir: string, data: CacheData) {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(getCachePath(cacheDir), JSON.stringify(data));
}

function chunkKey(chunk: DocChunk): string {
  return `${chunk.source}::${chunk.hash}`;
}

// ---------------------------------------------------------------------------
// Search index
// ---------------------------------------------------------------------------

export class SearchIndex {
  private chunks: DocChunk[] = [];
  private embeddings: number[][] = [];
  private ready = false;

  /** Build or load the search index from document chunks. */
  async build(chunks: DocChunk[], cacheDir: string): Promise<void> {
    this.chunks = chunks;
    const cache = loadCache(cacheDir);

    // Figure out which chunks need embedding
    const needsEmbedding: number[] = [];
    this.embeddings = new Array(chunks.length);

    for (let i = 0; i < chunks.length; i++) {
      const key = chunkKey(chunks[i]);
      const cached = cache?.entries[key];
      if (cached && cached.hash === chunks[i].hash) {
        this.embeddings[i] = cached.embedding;
      } else {
        needsEmbedding.push(i);
      }
    }

    if (needsEmbedding.length > 0) {
      const cachedCount = chunks.length - needsEmbedding.length;
      if (cachedCount > 0) {
        console.error(`Embedding ${needsEmbedding.length} chunks (${cachedCount} cached)...`);
      } else {
        console.error(`Embedding ${needsEmbedding.length} chunks...`);
      }

      // Embed in batches of 32 to avoid memory spikes
      const BATCH_SIZE = 32;
      for (let start = 0; start < needsEmbedding.length; start += BATCH_SIZE) {
        const batchIndices = needsEmbedding.slice(start, start + BATCH_SIZE);
        const texts = batchIndices.map(i => chunks[i].text);
        const vectors = await embedBatch(texts);
        for (let j = 0; j < batchIndices.length; j++) {
          this.embeddings[batchIndices[j]] = vectors[j];
        }
      }

      // Save updated cache
      const entries: Record<string, CacheEntry> = {};
      for (let i = 0; i < chunks.length; i++) {
        entries[chunkKey(chunks[i])] = {
          hash: chunks[i].hash,
          embedding: this.embeddings[i],
        };
      }
      saveCache(cacheDir, { model: MODEL_ID, entries });
      console.error("Embeddings cached to disk.");
    } else {
      console.error(`All ${chunks.length} chunk embeddings loaded from cache.`);
    }

    this.ready = true;
  }

  /** Semantic search: embed the query and find the most similar chunks. */
  async search(query: string, limit: number): Promise<SearchResult[]> {
    if (!this.ready) throw new Error("Search index not built yet");

    const queryVec = await embedText(query);

    // Score all chunks
    const scored: Array<{ index: number; score: number }> = [];
    for (let i = 0; i < this.chunks.length; i++) {
      scored.push({ index: i, score: dotProduct(queryVec, this.embeddings[i]) });
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Take top N, deduplicating by source file (keep best chunk per file)
    const seen = new Set<string>();
    const results: SearchResult[] = [];

    for (const { index, score } of scored) {
      if (results.length >= limit) break;
      const chunk = this.chunks[index];

      // Skip low relevance results
      if (score < 0.25) break;

      // Deduplicate: one result per source+heading pair
      const dedupeKey = `${chunk.source}::${chunk.heading}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      // Create snippet (first 300 chars of chunk text)
      const snippet = chunk.text.replace(/\s+/g, " ").trim();
      const truncated = snippet.length > 300 ? snippet.slice(0, 300) + "..." : snippet;

      results.push({
        source: chunk.source,
        heading: chunk.heading,
        snippet: truncated,
        uri: chunk.uri,
        score: Math.round(score * 1000) / 1000,
        contentType: chunk.contentType,
      });
    }

    return results;
  }

  get isReady(): boolean {
    return this.ready;
  }

  get chunkCount(): number {
    return this.chunks.length;
  }
}
