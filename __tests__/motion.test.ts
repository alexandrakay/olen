test("motion/react exports motion and AnimatePresence", async () => {
  const mod = await import("motion/react");
  expect(typeof mod.motion).toBe("function");
  expect(typeof mod.AnimatePresence).toBe("function");
});

test("motion/react exports useReducedMotion hook", async () => {
  const mod = await import("motion/react");
  expect(typeof mod.useReducedMotion).toBe("function");
});
