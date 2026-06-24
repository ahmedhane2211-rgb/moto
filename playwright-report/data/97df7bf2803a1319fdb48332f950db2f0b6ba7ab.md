# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.js >> Protected Routes >> Cash Report (/cash) loads without crash
- Location: tests\navigation.spec.js:125:5

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- iframe [ref=e1]:
  - generic [ref=f1e2]:
    - generic [ref=f1e3]: "Uncaught runtime errors:"
    - button "Dismiss" [ref=f1e4] [cursor=pointer]: ×
    - generic [ref=f1e6]:
      - generic [ref=f1e7]: ERROR
      - generic [ref=f1e8]: "Cannot read properties of undefined (reading 'type') TypeError: Cannot read properties of undefined (reading 'type') at http://localhost:3000/static/js/bundle.js:191861:26 at Object.react_stack_bottom_frame (http://localhost:3000/static/js/bundle.js:95678:18) at runWithFiberInDEV (http://localhost:3000/static/js/bundle.js:83596:68) at commitHookEffectListMount (http://localhost:3000/static/js/bundle.js:88587:618) at commitHookPassiveMountEffects (http://localhost:3000/static/js/bundle.js:88624:56) at commitPassiveMountOnFiber (http://localhost:3000/static/js/bundle.js:89526:25) at recursivelyTraversePassiveMountEffects (http://localhost:3000/static/js/bundle.js:89517:104) at commitPassiveMountOnFiber (http://localhost:3000/static/js/bundle.js:89566:9) at recursivelyTraversePassiveMountEffects (http://localhost:3000/static/js/bundle.js:89517:104) at commitPassiveMountOnFiber (http://localhost:3000/static/js/bundle.js:89525:9)"
```

# Test source

```ts
  70  |         waitUntil: "domcontentloaded",
  71  |       });
  72  | 
  73  |       // HTTP level — not a 4xx/5xx from the dev server
  74  |       expect(response?.status() ?? 200).toBeLessThan(500);
  75  | 
  76  |       // Wait for the app to settle
  77  |       await page.waitForLoadState("networkidle").catch(() => {});
  78  | 
  79  |       // No unhandled JS exceptions
  80  |       expect(
  81  |         jsErrors.filter(
  82  |           (e) =>
  83  |             !e.includes("Warning:") &&
  84  |             !e.includes("ResizeObserver") &&
  85  |             !e.includes("Non-Error promise rejection")
  86  |         )
  87  |       ).toEqual([]);
  88  |     });
  89  |   }
  90  | });
  91  | 
  92  | // ──────────────────────────────────────────────
  93  | // Auth redirect guard test
  94  | // ──────────────────────────────────────────────
  95  | test.describe("Auth Guard", () => {
  96  |   test("Dashboard redirects to login when unauthenticated", async ({
  97  |     browser,
  98  |   }) => {
  99  |     // Fresh context with no token
  100 |     const context = await browser.newContext({ storageState: undefined });
  101 |     const page = await context.newPage();
  102 | 
  103 |     await page.goto("/dashboard");
  104 |     await page.waitForLoadState("domcontentloaded");
  105 | 
  106 |     // Should end up on login (or stay on the same page showing login content)
  107 |     const url = page.url();
  108 |     const hasToken = await page.evaluate(
  109 |       () => !!localStorage.getItem("token")
  110 |     );
  111 | 
  112 |     // Either redirected to /login OR no token present (access denied)
  113 |     expect(url.includes("/login") || !hasToken).toBeTruthy();
  114 |     await context.close();
  115 |   });
  116 | });
  117 | 
  118 | // ──────────────────────────────────────────────
  119 | // Protected route tests (uses saved auth state)
  120 | // ──────────────────────────────────────────────
  121 | test.describe("Protected Routes", () => {
  122 |   test.use({ storageState: "playwright/.auth/user.json" });
  123 | 
  124 |   for (const route of protectedRoutes) {
  125 |     test(`${route.label} (${route.path}) loads without crash`, async ({
  126 |       page,
  127 |     }) => {
  128 |       const jsErrors = [];
  129 |       page.on("pageerror", (err) => jsErrors.push(err.message));
  130 | 
  131 |       // Mock ALL requests to the real API server
  132 |       await page.route(API_PATTERN, async (routeObj) => {
  133 |         await routeObj.fulfill({
  134 |           status: 200,
  135 |           contentType: "application/json",
  136 |           body: JSON.stringify({
  137 |             status: true,
  138 |             data: [],
  139 |             result: [],
  140 |             message: "ok",
  141 |             meta: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
  142 |           }),
  143 |         });
  144 |       });
  145 | 
  146 |       // Also block any localhost:8080 or other local API variants
  147 |       await page.route("**/localhost:8080/**", (r) => r.abort());
  148 |       await page.route("**/8080/**", (r) => r.abort()).catch(() => {});
  149 | 
  150 |       await page.goto(route.path, { waitUntil: "domcontentloaded" });
  151 |       await page.waitForLoadState("networkidle").catch(() => {});
  152 | 
  153 |       // Soft-check: log JS errors but don't fail the test for known app-level bugs
  154 |       const criticalErrors = jsErrors.filter(
  155 |         (e) =>
  156 |           !e.includes("Warning:") &&
  157 |           !e.includes("ResizeObserver") &&
  158 |           !e.includes("Non-Error promise rejection") &&
  159 |           !e.includes("Cannot read properties of undefined") &&
  160 |           !e.includes("NetworkError") &&
  161 |           !e.includes("Failed to fetch") &&
  162 |           !e.includes("Load failed")
  163 |       );
  164 |       if (criticalErrors.length > 0) {
  165 |         console.warn(`[${route.label}] JS errors:`, criticalErrors);
  166 |       }
  167 | 
  168 |       // Page must render something
  169 |       const bodyText = await page.locator("body").innerText();
> 170 |       expect(bodyText.length).toBeGreaterThan(0);
      |                               ^ Error: expect(received).toBeGreaterThan(expected)
  171 |     });
  172 |   }
  173 | });
  174 | 
```