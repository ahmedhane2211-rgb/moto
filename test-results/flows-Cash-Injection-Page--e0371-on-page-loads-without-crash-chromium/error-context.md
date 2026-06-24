# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flows.spec.js >> Cash Injection Page >> Cash Injection page loads without crash
- Location: tests\flows.spec.js:165:3

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
  78  |     await page.waitForLoadState("networkidle").catch(() => {});
  79  | 
  80  |     // Page loaded without crash
  81  |     const body = await page.locator("body").innerText();
  82  |     expect(body.length).toBeGreaterThan(10);
  83  | 
  84  |     // Take a screenshot for visual inspection
  85  |     await page.screenshot({ path: "playwright/screenshots/dashboard.png" });
  86  |   });
  87  | });
  88  | 
  89  | // ──────────────────────────────────────────────
  90  | // Login Form Validations
  91  | // ──────────────────────────────────────────────
  92  | test.describe("Login Form Validations", () => {
  93  |   test("Email field is required", async ({ page }) => {
  94  |     await page.goto("/login");
  95  |     await page.waitForLoadState("domcontentloaded");
  96  | 
  97  |     const emailInput = page.locator('input[type="email"]');
  98  |     await expect(emailInput).toBeVisible();
  99  |     const isRequired = await emailInput.evaluate((el) => el.required);
  100 |     expect(isRequired).toBe(true);
  101 |   });
  102 | 
  103 |   test("Password field is required", async ({ page }) => {
  104 |     await page.goto("/login");
  105 |     await page.waitForLoadState("domcontentloaded");
  106 | 
  107 |     const passwordInput = page.locator('input[type="password"]');
  108 |     await expect(passwordInput).toBeVisible();
  109 |     const isRequired = await passwordInput.evaluate((el) => el.required);
  110 |     expect(isRequired).toBe(true);
  111 |   });
  112 | 
  113 |   test("Invalid credentials show error message", async ({ page }) => {
  114 |     // Mock login to return 401
  115 |     await page.route(API_PATTERN, async (route) => {
  116 |       await route.fulfill({
  117 |         status: 401,
  118 |         contentType: "application/json",
  119 |         body: JSON.stringify({ status: false, message: "بيانات خاطئة" }),
  120 |       });
  121 |     });
  122 | 
  123 |     await page.goto("/login");
  124 |     await page.locator('input[type="email"]').fill("wrong@email.com");
  125 |     await page.locator('input[type="password"]').fill("wrongpassword");
  126 |     await page.locator('button[type="submit"]').click();
  127 | 
  128 |     // URL should remain at /login (no redirect)
  129 |     await page.waitForTimeout(1500);
  130 |     expect(page.url()).toContain("/login");
  131 |   });
  132 | });
  133 | 
  134 | // ──────────────────────────────────────────────
  135 | // Car Sales Page Flow
  136 | // ──────────────────────────────────────────────
  137 | test.describe("Car Sales Page", () => {
  138 |   test.use({ storageState: "playwright/.auth/user.json" });
  139 | 
  140 |   test("Car Sales page loads table or empty state", async ({ page }) => {
  141 |     await page.route(API_PATTERN, async (route) => {
  142 |       await route.fulfill({
  143 |         status: 200,
  144 |         contentType: "application/json",
  145 |           body: JSON.stringify({ status: true, data: [], result: [], meta: { total: 0 } }),
  146 |       });
  147 |     });
  148 | 
  149 |     await page.goto("/car-sales");
  150 |     await page.waitForLoadState("networkidle").catch(() => {});
  151 | 
  152 |     const body = await page.locator("body").innerText();
  153 |     expect(body.length).toBeGreaterThan(0);
  154 | 
  155 |     await page.screenshot({ path: "playwright/screenshots/car-sales.png" });
  156 |   });
  157 | });
  158 | 
  159 | // ──────────────────────────────────────────────
  160 | // Cash Injection Page Flow
  161 | // ──────────────────────────────────────────────
  162 | test.describe("Cash Injection Page", () => {
  163 |   test.use({ storageState: "playwright/.auth/user.json" });
  164 | 
  165 |   test("Cash Injection page loads without crash", async ({ page }) => {
  166 |     await page.route(API_PATTERN, async (route) => {
  167 |       await route.fulfill({
  168 |         status: 200,
  169 |         contentType: "application/json",
  170 |           body: JSON.stringify({ status: true, data: [], result: [], meta: { total: 0 } }),
  171 |       });
  172 |     });
  173 | 
  174 |     await page.goto("/cash-injection");
  175 |     await page.waitForLoadState("networkidle").catch(() => {});
  176 | 
  177 |     const body = await page.locator("body").innerText();
> 178 |     expect(body.length).toBeGreaterThan(0);
      |                         ^ Error: expect(received).toBeGreaterThan(expected)
  179 | 
  180 |     await page.screenshot({
  181 |       path: "playwright/screenshots/cash-injection.png",
  182 |     });
  183 |   });
  184 | });
  185 | 
```