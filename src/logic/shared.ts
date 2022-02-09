export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b > a) [a, b] = [b, a];
  if (b === 0) return a;
  return gcd(b, a % b);
};
