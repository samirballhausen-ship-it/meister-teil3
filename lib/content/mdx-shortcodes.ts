/**
 * MDX-Shortcodes Parser · ohne regex.exec-Iterator
 * Beispiele:
 *   [[fakt zahl="800.000" einheit="€" label="Schwelle"]]
 *   [[tipp typ="info"]] Text mit **Markdown** [[/tipp]]
 */

export type Segment =
  | { kind: "markdown"; text: string }
  | { kind: "shortcode"; name: string; props: Record<string, string>; body?: string };

function parseProps(raw: string): Record<string, string> {
  const props: Record<string, string> = {};
  const matches = raw.matchAll(/(\w[\w-]*)="([^"]*)"/g);
  for (const m of matches) props[m[1]] = m[2];
  return props;
}

export function parseShortcodes(body: string): Segment[] {
  const segments: Segment[] = [];
  const openRe = /\[\[(\w+)((?:\s+[\w-]+="[^"]*")*)\]\]/g;
  const opens = [...body.matchAll(openRe)];

  let lastIndex = 0;
  let i = 0;
  while (i < opens.length) {
    const m = opens[i];
    const [full, name, propsRaw] = m;
    const start = m.index ?? 0;

    if (start > lastIndex) {
      const md = body.slice(lastIndex, start);
      if (md.trim()) segments.push({ kind: "markdown", text: md });
    }

    const closeTag = `[[/${name}]]`;
    const restIdx = start + full.length;
    const closeIdx = body.indexOf(closeTag, restIdx);

    if (closeIdx !== -1) {
      const blockBody = body.slice(restIdx, closeIdx);
      segments.push({
        kind: "shortcode", name,
        props: parseProps(propsRaw),
        body: blockBody,
      });
      lastIndex = closeIdx + closeTag.length;
      // Skip further opens that fall inside this block
      while (i < opens.length && (opens[i].index ?? 0) < lastIndex) i++;
    } else {
      segments.push({ kind: "shortcode", name, props: parseProps(propsRaw) });
      lastIndex = start + full.length;
      i++;
    }
  }

  if (lastIndex < body.length) {
    const md = body.slice(lastIndex);
    if (md.trim()) segments.push({ kind: "markdown", text: md });
  }

  return segments;
}
