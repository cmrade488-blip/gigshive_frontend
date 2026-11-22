export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: "40rem",
        margin: "4rem auto",
        padding: "0 1.5rem",
      }}
    >
      <h1 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "0.5rem" }}>GigsHive</h1>
      <p style={{ color: "#555", marginBottom: "1.5rem" }}>
        Marketplace web app skeleton. Feature screens land with later tasks.
      </p>
      <p style={{ fontSize: "0.875rem", color: "#777" }}>
        Surface: <code>apps/web</code> · Port 3000 · FE-002
      </p>
    </main>
  );
}
