// Mini-Markdown das notícias: `#`..`######` títulos, `**negrito**`, `*itálico*`, `***ambos***` e
// URLs de imagem em qualquer lugar do texto (ou `![alt](url)`) viram imagens. Sem HTML: o texto
// nunca é interpretado como marcação, só como texto.
// Mantenha idêntico a VoidMMA.FE.Client/src/features/news/parseNews.ts.

export interface Inline {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export type NewsBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; inline: Inline[] }
  | { type: 'paragraph'; inline: Inline[] }
  | { type: 'image'; url: string };

// ![alt](url) com qualquer https/http, ou URL solta terminando em extensão de imagem.
const IMAGE = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s<>()"']+?\.(?:png|jpe?g|gif|webp|avif|svg)(?:\?[^\s<>()"']*)?)(?=$|[\s<>)"'])/gi;
const EMPHASIS = /(\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/;

export function parseInline(text: string): Inline[] {
  return text
    .split(EMPHASIS)
    .filter(Boolean)
    .map((part): Inline => {
      if (part.startsWith('***') && part.endsWith('***') && part.length > 6) return { text: part.slice(3, -3), bold: true, italic: true };
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return { text: part.slice(2, -2), bold: true };
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return { text: part.slice(1, -1), italic: true };
      return { text: part };
    });
}

export function parseNews(body: string): NewsBlock[] {
  const blocks: NewsBlock[] = [];
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({ type: 'heading', level: (heading[1] ?? '#').length as 1 | 2 | 3 | 4 | 5 | 6, inline: parseInline(heading[2] ?? '') });
      continue;
    }

    let last = 0;
    for (const match of line.matchAll(IMAGE)) {
      const before = line.slice(last, match.index).trim();
      if (before) blocks.push({ type: 'paragraph', inline: parseInline(before) });
      blocks.push({ type: 'image', url: match[1] ?? match[2] ?? '' });
      last = (match.index ?? 0) + match[0].length;
    }
    const rest = line.slice(last).trim();
    if (rest) blocks.push({ type: 'paragraph', inline: parseInline(rest) });
  }
  return blocks;
}
