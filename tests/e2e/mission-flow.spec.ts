import { test, expect } from "@playwright/test";

const liveFeed = {
  source: "USGS Earthquake Hazards Program",
  generated: 1_784_000_100_000,
  events: [
    {
      id: "venezuela-test-1",
      magnitude: 5.2,
      place: "10 km north of La Guaira, Venezuela",
      time: 1_784_000_000_000,
      updated: 1_784_000_001_000,
      status: "reviewed",
      tsunami: false,
      alert: "yellow",
      longitude: -66.93,
      latitude: 10.6,
      depthKm: 12,
      detailUrl: "https://example.test/detail",
      eventUrl: "https://example.test/event",
    },
  ],
};

test("shows a Venezuela-focused live seismic event and safety action", async ({
  page,
}) => {
  await page.route("**/api/earthquakes", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(liveFeed),
    }),
  );
  await page.goto("/");

  await expect(
    page.getByText("Know the shaking.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("M 5.2", { exact: true })).toBeVisible();
  await expect(
    page.getByText("10 km north of La Guaira, Venezuela"),
  ).toBeVisible();
  await expect(page.getByTestId("epicenter-map")).toBeVisible();
  await expect(page.getByTestId("event-row")).toContainText("depth 12.0 km");
  await expect(page.getByTestId("event-row")).toContainText("HIGH ATTENTION");

  await page.getByLabel("Alert magnitude").fill("5.5");
  await expect(page.getByText("Minimum magnitude: M 5.5")).toBeVisible();
  await page.getByTestId("refresh-feed").click();
  await expect(page.getByText("During shaking", { exact: true })).toBeVisible();
});
