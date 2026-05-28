const bannedTerms = [
  "idiot",
  "stupid",
  "damn",
  "hell",
  "wtf",
  "trash",
  "moron",
  "loser",
  "scam",
  "fraud"
];

function normalized(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function containsProfanity(text: string) {
  const haystack = normalized(text);
  return bannedTerms.some((term) => haystack.includes(term));
}

export function looksSpammy(text: string) {
  const haystack = normalized(text);
  const repeatedCharacters = /(.)\1{5,}/.test(haystack);
  const repeatedWords = /\b(\w+)\b(?:\s+\1\b){3,}/.test(haystack);
  const tooManyLinks = (haystack.match(/https?:\/\//g) ?? []).length > 1;
  const phoneOrHandleDrop = /(\+?\d[\d\s-]{7,}\d)|(@[a-z0-9_]{3,})/i.test(haystack);
  const allCapsRatio = text.length > 12
    ? text.replace(/[^A-Z]/g, "").length / text.replace(/[^A-Za-z]/g, "").length > 0.7
    : false;
  const solicitation = /(dm me|telegram|whatsapp|call me|contact me)/i.test(haystack);
  return repeatedCharacters || repeatedWords || tooManyLinks || phoneOrHandleDrop || allCapsRatio || solicitation;
}

export function moderationMessage(text: string) {
  if (containsProfanity(text)) {
    return "Please keep discussion civil. Offensive language is not allowed.";
  }

  if (looksSpammy(text)) {
    return "Your message looks spammy. Please rewrite it in a clearer, non-repetitive way.";
  }

  return null;
}
