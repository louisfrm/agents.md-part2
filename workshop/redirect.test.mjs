import assert from "node:assert/strict";
import test from "node:test";

const base = process.env.TP_BASE_URL ?? "http://localhost:3000";

async function redirectLocation(to) {
  const suffix = to === undefined ? "" : `?to=${encodeURIComponent(to)}`;
  const response = await fetch(`${base}/api/go${suffix}`, {
    redirect: "manual",
  });
  assert.equal(response.status, 307);
  return response.headers.get("location");
}

test("sans destination, retourne à l'accueil", async () => {
  assert.equal(await redirectLocation(), "/");
});

test("accepte une page locale", async () => {
  assert.equal(await redirectLocation("/examples"), "/examples");
});

test("refuse une URL externe", async () => {
  assert.equal(await redirectLocation("https://example.net/login"), "/");
});

test("refuse une URL relative à un autre domaine", async () => {
  assert.equal(await redirectLocation("//example.net/login"), "/");
});

test("refuse un chemin qui contient une barre oblique inversée", async () => {
  assert.equal(await redirectLocation("/\\example.net/login"), "/");
});

test("refuse plusieurs destinations", async () => {
  const response = await fetch(`${base}/api/go?to=%2Fexamples&to=%2Felsewhere`, {
    redirect: "manual",
  });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/");
});
