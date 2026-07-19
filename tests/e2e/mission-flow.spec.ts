import { test, expect } from "@playwright/test";

test("creates a private household plan and a low-bandwidth help card", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();

  await page.getByTestId("quick-water").click();
  await expect(page.getByText("45 L", { exact: true })).toBeVisible();
  await expect(page.getByTestId("plan-action-water")).toContainText(
    "Prioritize safe water",
  );

  await page.getByTestId("open-request").click();
  await expect(page.getByTestId("request-code")).toContainText(
    "PHX1|A=LG|P=1|D=3|N=WATER",
  );
  await expect(
    page.getByText("NO NAMES OR COORDINATES", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "CREATE BILINGUAL RELAY" }).click();
  await expect(page.getByTestId("relay-spanish")).toContainText("1 persona");
  await expect(page.getByTestId("relay-spanish")).toContainText("agua segura");
  await expect(page.getByTestId("relay-english")).toContainText("safe water");
  await expect(page.getByText("VERIFIED PAYLOAD")).toBeVisible();

  await page.getByTestId("nav-guia").click();
  await expect(
    page.getByText("DURING AN AFTERSHOCK", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("THIS GUIDE STAYS AVAILABLE OFFLINE", { exact: true }),
  ).toBeVisible();

  await expect(page.getByText("OFFLINE READY", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload({ waitUntil: "commit", timeout: 5_000 });
  await expect(page.locator("main")).toBeVisible();
});
