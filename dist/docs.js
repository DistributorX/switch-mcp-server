/**
 * Document discovery, chunking, and metadata generation.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------
export function walkMarkdown(dir) {
    const results = [];
    const stack = [dir];
    while (stack.length > 0) {
        const current = stack.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory())
                stack.push(full);
            else if (entry.name.endsWith(".md"))
                results.push(full);
        }
    }
    return results;
}
export function pathToUri(relativePath) {
    const parts = relativePath.split(path.sep);
    return "switch-docs://" + parts.map(p => encodeURIComponent(p)).join("/");
}
export function generateName(relativePath) {
    const filename = path.basename(relativePath, ".md");
    const chapterMatch = filename.match(/Chapter\s+(\d+)\s*-\s*(.+)/i);
    if (chapterMatch)
        return `Chapter ${chapterMatch[1]}: ${chapterMatch[2].trim()}`;
    return filename
        .replace(/[-_]/g, " ")
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}
export function extractDescription(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        for (const line of content.split("\n")) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
                return trimmed.length > 200 ? trimmed.slice(0, 200) + "..." : trimmed;
            }
        }
    }
    catch { /* empty */ }
    return "Switch scripting documentation";
}
/** Discover all markdown files and return metadata. */
export function discoverDocs(docRoot) {
    return walkMarkdown(docRoot).map(fullPath => {
        const relativePath = path.relative(docRoot, fullPath);
        return {
            relativePath,
            uri: pathToUri(relativePath),
            displayName: generateName(relativePath),
            description: extractDescription(fullPath),
        };
    }).sort((a, b) => a.uri.localeCompare(b.uri));
}
// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------
/** Classify a file by its path into a content type. */
export function classifyContent(relativePath) {
    if (relativePath.startsWith("api/"))
        return "reference";
    if (relativePath.startsWith("examples/"))
        return "examples";
    if (relativePath.startsWith("dev/"))
        return "guide";
    if (relativePath.toLowerCase().includes("dialect"))
        return "patterns";
    if (relativePath.includes("Chapter"))
        return "manual";
    return "guide";
}
function hashText(text) {
    return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}
// Target max chunk size in chars (~512 tokens ≈ 2000 chars, allow some headroom)
const MAX_CHUNK_SIZE = 3000;
/**
 * Split a markdown file into chunks by ## headings, then sub-split oversized
 * chunks by paragraph boundaries. Ensures no chunk exceeds MAX_CHUNK_SIZE
 * so the embedding model can represent the full content.
 */
export function chunkMarkdown(content, relativePath, uri) {
    const fileTitle = generateName(relativePath);
    const contentType = classifyContent(relativePath);
    // For short files, keep as a single chunk
    if (content.length < 500) {
        const text = content.trim();
        return [{
                source: relativePath,
                heading: fileTitle,
                text,
                hash: hashText(text),
                uri,
                contentType,
            }];
    }
    // First pass: split by ## and ### headings
    const rawChunks = [];
    const lines = content.split("\n");
    let currentHeading = fileTitle;
    let currentLines = [];
    for (const line of lines) {
        if (line.match(/^#{2,3}\s+/) && currentLines.length > 0) {
            const text = currentLines.join("\n").trim();
            if (text.length > 0) {
                rawChunks.push({ heading: currentHeading, text });
            }
            currentHeading = line.replace(/^#+\s+/, "").trim();
            currentLines = [line];
        }
        else {
            currentLines.push(line);
        }
    }
    // Flush last section
    const lastText = currentLines.join("\n").trim();
    if (lastText.length > 0) {
        rawChunks.push({ heading: currentHeading, text: lastText });
    }
    // If no headings found, treat whole file as one raw chunk
    if (rawChunks.length === 0) {
        rawChunks.push({ heading: fileTitle, text: content.trim() });
    }
    // Second pass: split oversized chunks by paragraph boundaries
    const chunks = [];
    for (const raw of rawChunks) {
        if (raw.text.length <= MAX_CHUNK_SIZE) {
            chunks.push({
                source: relativePath,
                heading: raw.heading,
                text: raw.text,
                hash: hashText(raw.text),
                uri,
                contentType,
            });
        }
        else {
            const subChunks = splitByParagraphs(raw.text, raw.heading);
            for (const sub of subChunks) {
                chunks.push({
                    source: relativePath,
                    heading: sub.heading,
                    text: sub.text,
                    hash: hashText(sub.text),
                    uri,
                    contentType,
                });
            }
        }
    }
    return chunks;
}
/**
 * Split an oversized text block into sub-chunks that fit within MAX_CHUNK_SIZE.
 * First tries double-newline (paragraph) boundaries, then falls back to
 * single-newline (line) boundaries for anything still oversized.
 */
function splitByParagraphs(text, heading) {
    const subChunks = [];
    let partNum = 1;
    function flush(t) {
        const finalHeading = `${heading} (part ${partNum})`;
        subChunks.push({ heading: finalHeading, text: t.trim() });
        partNum++;
    }
    // First pass: split by double newlines (paragraphs)
    const paragraphs = text.split(/\n\n+/);
    let current = "";
    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed)
            continue;
        if (current.length > 0 && current.length + trimmed.length + 2 > MAX_CHUNK_SIZE) {
            // Flush current accumulator
            if (current.length > MAX_CHUNK_SIZE) {
                // Current is itself too big — sub-split by single lines
                splitByLines(current, flush);
            }
            else {
                flush(current);
            }
            current = trimmed;
        }
        else {
            current += (current ? "\n\n" : "") + trimmed;
        }
    }
    // Handle remainder
    if (current.trim().length > 0) {
        if (current.length > MAX_CHUNK_SIZE) {
            splitByLines(current, flush);
        }
        else {
            flush(current);
        }
    }
    // Clean up part numbers: if only 1 part, remove "(part 1)"
    if (subChunks.length === 1) {
        subChunks[0].heading = heading;
    }
    return subChunks;
}
/** Split text by single newlines, accumulating up to MAX_CHUNK_SIZE. */
function splitByLines(text, flush) {
    const lines = text.split("\n");
    let current = "";
    for (const line of lines) {
        if (current.length > 0 && current.length + line.length + 1 > MAX_CHUNK_SIZE) {
            flush(current);
            current = line;
        }
        else {
            current += (current ? "\n" : "") + line;
        }
    }
    if (current.trim().length > 0) {
        flush(current);
    }
}
/** Chunk all discovered documents. */
export function chunkAllDocs(docRoot, docFiles) {
    const allChunks = [];
    for (const doc of docFiles) {
        try {
            const content = fs.readFileSync(path.join(docRoot, doc.relativePath), "utf-8");
            const chunks = chunkMarkdown(content, doc.relativePath, doc.uri);
            allChunks.push(...chunks);
        }
        catch { /* skip unreadable files */ }
    }
    return allChunks;
}
