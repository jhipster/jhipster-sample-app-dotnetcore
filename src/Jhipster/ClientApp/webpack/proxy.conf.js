function setupProxy({ tls }) {
  const conf = [
    {
      context: [
        "/api",
        "/services",
        "/management",
        "/v3/api-docs",
        "/h2-console",
        "/auth",
        "/health",
      ],
      target: `http${tls ? "s" : ""}://localhost:5000`,
      secure: false,
      changeOrigin: tls,
    },
  ];
  return conf;
}

module.exports = setupProxy;
