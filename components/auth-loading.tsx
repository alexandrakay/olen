export function AuthLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF6EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-outfit)",
          fontWeight: 600,
          fontSize: "32px",
          color: "#3D2C20",
        }}
      >
        dot<span style={{ color: "#F0956A" }}>.</span>
      </p>
    </div>
  );
}
