import { test, expect } from "@playwright/test";

test("creates a private, offline handoff card for a disrupted treatment", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("A health card that still works", { exact: false }),
  ).toBeVisible();

  await page.getByLabel("Medication days").selectOption("0");
  await page
    .getByText("Water source or storage is uncertain", { exact: true })
    .click();
  await expect(page.getByTestId("priority-title")).toHaveText("Do this today");
  await expect(
    page.getByText("Show this card at the next available health point today."),
  ).toBeVisible();
  await expect(page.getByTestId("handoff-code")).toContainText(
    "PHX72|A=La Guaira|P=1|S=safe|M=0",
  );

  await page.getByTestId("copy-sms").click();
  await expect(page.getByTestId("copy-sms")).toBeEnabled();

  await page
    .getByText("Someone is trapped or cannot leave", { exact: true })
    .click();
  await expect(page.getByTestId("priority-title")).toHaveText("Act now");
  await expect(
    page.getByText("If you can: text your location landmark", { exact: false }),
  ).toBeVisible();

  await expect(page.getByText("READY", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload({ waitUntil: "commit", timeout: 5_000 });
  await expect(page.locator("main")).toBeVisible();
});
