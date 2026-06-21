import {
  canAddContext,
  canAddNonNeg,
  SOFT_LIMIT_WARNING,
  NON_NEG_CAP_MESSAGE,
} from "@/lib/context-management";

test("canAddContext allows when under 7 active", () => {
  expect(canAddContext(6)).toEqual({ allowed: true, warn: false });
});

test("canAddContext warns at exactly 7 active", () => {
  expect(canAddContext(7)).toEqual({ allowed: true, warn: true });
});

test("canAddContext warns above 7 active", () => {
  expect(canAddContext(9)).toEqual({ allowed: true, warn: true });
});

test("canAddContext allows at 0 active", () => {
  expect(canAddContext(0)).toEqual({ allowed: true, warn: false });
});

test("canAddNonNeg allows when under 3", () => {
  expect(canAddNonNeg(2)).toBe(true);
});

test("canAddNonNeg blocks at exactly 3", () => {
  expect(canAddNonNeg(3)).toBe(false);
});

test("canAddNonNeg blocks above 3", () => {
  expect(canAddNonNeg(4)).toBe(false);
});

test("canAddNonNeg allows at 0", () => {
  expect(canAddNonNeg(0)).toBe(true);
});

test("SOFT_LIMIT_WARNING contains expected copy", () => {
  expect(SOFT_LIMIT_WARNING).toMatch(/7 active contexts/);
  expect(SOFT_LIMIT_WARNING).toMatch(/archiving/);
});

test("NON_NEG_CAP_MESSAGE contains expected copy", () => {
  expect(NON_NEG_CAP_MESSAGE).toMatch(/3 non-negotiables/);
  expect(NON_NEG_CAP_MESSAGE).toMatch(/won't compromise/);
});
