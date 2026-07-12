const meta = document.getElementById("build-meta");
if (meta) {
  meta.textContent = `Built with Vite · mode=${import.meta.env.MODE} · ready at ${new Date().toISOString()}`;
}
