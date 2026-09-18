export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.status = 400;
  }
}

export function requireString(value, field, { max = 200 } = {}) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${field} is required.`, field);
  }
  if (value.length > max) {
    throw new ValidationError(`${field} must be ${max} characters or fewer.`, field);
  }
  return value.trim();
}

export function optionalString(value, field, { max = 500 } = {}) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new ValidationError(`${field} must be text.`, field);
  if (value.length > max) throw new ValidationError(`${field} must be ${max} characters or fewer.`, field);
  return value.trim();
}

export function requireId(value, field) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ValidationError(`${field} must be a valid id.`, field);
  }
  return n;
}

export function validateGames(games) {
  if (games == null) return null;
  if (!Array.isArray(games) || games.length === 0) {
    throw new ValidationError("games must be a non-empty array when provided.", "games");
  }
  if (games.length > 9) {
    throw new ValidationError("A match can have at most 9 games.", "games");
  }
  const parsed = games.map((g, i) => {
    const p1 = Number(g.p1);
    const p2 = Number(g.p2);
    if (!Number.isInteger(p1) || !Number.isInteger(p2) || p1 < 0 || p2 < 0 || p1 > 99 || p2 > 99) {
      throw new ValidationError(`Game ${i + 1} scores must be whole numbers between 0 and 99.`, "games");
    }
    if (p1 === p2) {
      throw new ValidationError(`Game ${i + 1} cannot end in a tie.`, "games");
    }
    return { p1, p2 };
  });
  return parsed;
}

export function validatePlayedAt(value) {
  if (value == null || value === "") return new Date().toISOString();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new ValidationError("playedAt must be a valid date/time.", "playedAt");
  }
  return d.toISOString();
}
