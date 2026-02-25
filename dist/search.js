/**
 * Semantic search using local embeddings via Transformers.js.
 * Generates embeddings for document chunks, caches them to disk,
 * and performs cosine similarity search at query time.
 */
import fs from "node:fs";
import path from "node:path";
// ---------------------------------------------------------------------------
// Embedding pipeline (lazy singleton)
// ---------------------------------------------------------------------------
let pipelineInstance = null;
const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
async function getEmbedder() {
    if (pipelineInstance)
        return pipelineInstance;
    // Dynamic import to avoid loading the heavy module until needed
    const { pipeline } = await import("@huggingface/transformers");
    console.error(`Loading embedding model (${MODEL_ID})...`);
    pipelineInstance = await pipeline("feature-extraction", MODEL_ID);
    console.error("Embedding model loaded.");
    return pipelineInstance;
}
/** Embed a single text string. Returns a 384-dim float array. */
async function embedText(text) {
    const extractor = await getEmbedder();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
}
/** Embed a batch of texts. Returns array of 384-dim float arrays. */
async function embedBatch(texts) {
    if (texts.length === 0)
        return [];
    const extractor = await getEmbedder();
    const output = await extractor(texts, { pooling: "mean", normalize: true });
    const vectors = output.tolist();
    return vectors;
}
// ---------------------------------------------------------------------------
// Vector math
// ---------------------------------------------------------------------------
/** Dot product of two vectors (cosine similarity when both are L2-normalized). */
function dotProduct(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++)
        sum += a[i] * b[i];
    return sum;
}
// ---------------------------------------------------------------------------
// Embedding cache
// ---------------------------------------------------------------------------
function getCachePath(cacheDir) {
    return path.join(cacheDir, "embeddings.json");
}
function loadCache(cacheDir) {
    const cachePath = getCachePath(cacheDir);
    try {
        if (fs.existsSync(cachePath)) {
            const raw = fs.readFileSync(cachePath, "utf-8");
            const data = JSON.parse(raw);
            if (data.model === MODEL_ID)
                return data;
            console.error("Cache model mismatch, will regenerate embeddings.");
        }
    }
    catch {
        console.error("Cache corrupted, will regenerate embeddings.");
    }
    return null;
}
function saveCache(cacheDir, data) {
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(getCachePath(cacheDir), JSON.stringify(data));
}
function chunkKey(chunk) {
    return `${chunk.source}::${chunk.hash}`;
}
// ---------------------------------------------------------------------------
// Search index
// ---------------------------------------------------------------------------
export class SearchIndex {
    chunks = [];
    embeddings = [];
    ready = false;
    /** Build or load the search index from document chunks. */
    async build(chunks, cacheDir) {
        this.chunks = chunks;
        const cache = loadCache(cacheDir);
        // Figure out which chunks need embedding
        const needsEmbedding = [];
        this.embeddings = new Array(chunks.length);
        for (let i = 0; i < chunks.length; i++) {
            const key = chunkKey(chunks[i]);
            const cached = cache?.entries[key];
            if (cached && cached.hash === chunks[i].hash) {
                this.embeddings[i] = cached.embedding;
            }
            else {
                needsEmbedding.push(i);
            }
        }
        if (needsEmbedding.length > 0) {
            const cachedCount = chunks.length - needsEmbedding.length;
            if (cachedCount > 0) {
                console.error(`Embedding ${needsEmbedding.length} chunks (${cachedCount} cached)...`);
            }
            else {
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
            const entries = {};
            for (let i = 0; i < chunks.length; i++) {
                entries[chunkKey(chunks[i])] = {
                    hash: chunks[i].hash,
                    embedding: this.embeddings[i],
                };
            }
            saveCache(cacheDir, { model: MODEL_ID, entries });
            console.error("Embeddings cached to disk.");
        }
        else {
            console.error(`All ${chunks.length} chunk embeddings loaded from cache.`);
        }
        this.ready = true;
    }
    /** Semantic search: embed the query and find the most similar chunks. */
    async search(query, limit) {
        if (!this.ready)
            throw new Error("Search index not built yet");
        const queryVec = await embedText(query);
        // Score all chunks
        const scored = [];
        for (let i = 0; i < this.chunks.length; i++) {
            scored.push({ index: i, score: dotProduct(queryVec, this.embeddings[i]) });
        }
        // Sort by score descending
        scored.sort((a, b) => b.score - a.score);
        // Take top N, deduplicating by source file (keep best chunk per file)
        const seen = new Set();
        const results = [];
        for (const { index, score } of scored) {
            if (results.length >= limit)
                break;
            const chunk = this.chunks[index];
            // Skip low relevance results
            if (score < 0.25)
                break;
            // Deduplicate: one result per source+heading pair
            const dedupeKey = `${chunk.source}::${chunk.heading}`;
            if (seen.has(dedupeKey))
                continue;
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
    get isReady() {
        return this.ready;
    }
    get chunkCount() {
        return this.chunks.length;
    }
}
