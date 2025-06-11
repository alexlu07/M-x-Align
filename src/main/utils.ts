function euclidean(a, b): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function angleBetween(a, b, c): number {
  // angle at point b
  const ab = [a.x - b.x, a.y - b.y, a.z - b.z];
  const cb = [c.x - b.x, c.y - b.y, c.z - b.z];
  const dot = ab[0] * cb[0] + ab[1] * cb[1] + ab[2] * cb[2];
  const mag1 = Math.sqrt(ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2);
  const mag2 = Math.sqrt(cb[0] ** 2 + cb[1] ** 2 + cb[2] ** 2);
  const clamped = Math.max(-1, Math.min(1, dot / (mag1 * mag2))); // clamp to avoid NaN
  return Math.acos(clamped); // in radians
}

function midpoint(a, b): { x: number; y: number; z: number } {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
  };
}

export { euclidean, angleBetween, midpoint };
