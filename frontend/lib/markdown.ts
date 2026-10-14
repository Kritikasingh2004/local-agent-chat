export function markdownToPlainText(markdown: string) {
  return markdown
    .replace(/```[^\n]*\n([\s\S]*?)```/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*([-*+] |\d+\. )/gm, (_, marker: string) =>
      marker.match(/^\d/) ? marker : '- ',
    )
    .replace(/^\s*([-*_])(?:\s*\1){2,}\s*$/gm, '')
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, '')
    .replace(/^\s*\|\s?/, '')
    .replace(/\s?\|\s?/g, ' | ')
    .replace(/!?\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/(```|`|\*\*|__|~~|\*|_)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
