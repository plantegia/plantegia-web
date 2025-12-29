export function generateAbbreviation(name: string): string {
  if (!name.trim()) return 'PLT';

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  const abbr = words
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);

  return abbr || 'PLT';
}

export function generatePlantCode(
  abbreviation: string,
  existingCodes: string[]
): string {
  const prefix = abbreviation || 'PLT';

  const numbers = existingCodes
    .filter(code => code.startsWith(prefix + '-'))
    .map(code => {
      const num = parseInt(code.slice(prefix.length + 1), 10);
      return isNaN(num) ? 0 : num;
    });

  const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  return `${prefix}-${nextNum}`;
}
