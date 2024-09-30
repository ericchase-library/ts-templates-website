export function Midpoint(a: number, b: number): number {
  return 0 === (b - a) % 2 ? (a + b) / 2 : (a + b - 1) / 2;
}
