import { describe, expect, it } from "vitest";
import { calculateAmount, editCalculator, canConvertAmount, reduceFraction } from "../src/ui/client/calculator";

describe("calculator amounts", () => {
  it.each([
    ["1000000000001", "1000000000001"], ["1000000000000*1000", "1000000000000000"],
    ["100+25*3", "175"], ["0.1+0.2", "0.3"], ["100/3", "33.33333333"],
    ["10-2-3", "5"], ["10/-2", "-5"], [".5*2", "1"], ["1.25*0.8", "1"],
    ["10%", "0.1"], ["-10%", "-0.1"], ["200+10%", "220"], ["200-10%", "180"],
    ["200*10%", "20"], ["200/10%", "2000"], ["100+20*10%", "102"],
    ["200+10%+10%", "242"], ["0+10%", "0"], ["0", "0"], ["1000", "1000"], ["1/3*3", "1"], ["1/200000000", "0.00000001"],
  ])("evaluates %s", (expression, result) => expect(calculateAmount(expression)).toBe(result));
  it.each(["10%%", "%10", "200/0%", "1/0", "2+", "2**3", "alert(1)", "1..2", "1e3", "0.123456789", "9".repeat(121)])("rejects %s", expression => {
    expect(() => calculateAmount(expression)).toThrow();
  });
});

describe("calculator editing", () => {
  it("resets AC to a valid zero and replaces it on the next digit", () => {
    const reset = editCalculator("200+10%", "clear", false);
    expect(reset).toEqual({ value: "0", solved: true });
    expect(calculateAmount(reset.value)).toBe("0");
    expect(editCalculator(reset.value, "5", reset.solved)).toEqual({ value: "5", solved: false });
    expect(editCalculator("5", "back", false)).toEqual({ value: "", solved: false });
  });
  it.each([
    ["98/*-+-/*-", "98-"], ["55*536*", "55*536*"],
    ["12..3", "12.3"], ["10%%", "10%"], ["10%2", "10%"],
    [".5+.", "0.5+0."], ["1.123456789", "1.12345678"],
  ])("normalizes %s", (keys, expected) => {
    let state = { value: "", solved: false };
    for (const key of keys) state = editCalculator(state.value, key, state.solved);
    expect(state.value).toBe(expected);
    expect(state.value).not.toMatch(/[+\-*/]{2}/);
  });
  it("continues from a result, then returns to editing", () => {
    const result = editCalculator("55*536", "=", false);
    expect(result).toEqual({ value: "55*536", solved: true });
    expect(editCalculator(result.value, "*", result.solved)).toEqual({ value: "29480*", solved: false });
    expect(editCalculator(result.value, "9", result.solved)).toEqual({ value: "9", solved: false });
  });
  it("keeps a pending operator in editing mode when equals is pressed", () => {
    expect(editCalculator("55*536*", "=", false)).toEqual({ value: "55*536*", solved: false });
  });
});

describe("calculator resource and precision boundaries", () => {
  it("reduces signed and zero fractions", () => {
    expect(reduceFraction(10n, -20n)).toEqual([-1n, 2n]);
    expect(reduceFraction(0n, 100000000n)).toEqual([0n, 1n]);
  });
  it("evaluates a near-limit percentage chain without growing unreduced fractions", () => {
    const started = performance.now();
    expect(calculateAmount("100" + "+1%".repeat(24))).toBe("126.97346485");
    expect(performance.now() - started).toBeLessThan(250);
    expect(calculateAmount("100" + "+1%".repeat(38))).toBe("145.95272361");
  }, 1000);
  it.each([
    ["1000000000001", true], ["1000000000000000", true],
    ["0.12345678", true], ["9007199254740992", true],
    ["9007199254740993", false], ["1000000000000.00000001", false],
    ["1" + "0".repeat(309), false],
  ])("checks whether %s survives conversion", (value, expected) => {
    expect(canConvertAmount(value)).toBe(expected);
  });
});
