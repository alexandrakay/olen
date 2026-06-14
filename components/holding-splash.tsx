export function HoldingSplash() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#FAF6EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Blur orbs */}
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: "-8rem",
          left: "-8rem",
          height: "28rem",
          width: "28rem",
          borderRadius: "9999px",
          background: "#F0956A",
          filter: "blur(80px)",
          opacity: 0.22,
        }}
      />
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          bottom: "-8rem",
          right: "-8rem",
          height: "32rem",
          width: "32rem",
          borderRadius: "9999px",
          background: "#F4D080",
          filter: "blur(80px)",
          opacity: 0.25,
        }}
      />
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: "33%",
          right: "-6rem",
          height: "18rem",
          width: "18rem",
          borderRadius: "9999px",
          background: "#F0956A",
          filter: "blur(70px)",
          opacity: 0.15,
        }}
      />

      {/* Tagline */}
      <p
        style={{
          position: "relative",
          zIndex: 10,
          fontFamily: "var(--font-lexend)",
          fontWeight: 300,
          fontSize: "22px",
          color: "#3D2C20",
          lineHeight: 1.6,
          textAlign: "center",
          padding: "0 2rem",
        }}
      >
        not everything. just the next thing.
      </p>
    </div>
  );
}
