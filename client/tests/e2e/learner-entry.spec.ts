import { expect, test } from "@playwright/test";

test("home leads to the learner intake", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Hiểu năng lực của bạn");

  await page.getByRole("link", { name: "Bắt đầu với hồ sơ của tôi" }).click();

  await expect(page).toHaveURL(/\/upload$/);
  await expect(page.getByRole("heading", { name: "Bắt đầu với thông tin của bạn" })).toBeVisible();
  await expect(page.getByText("Bạn có thể xem câu hỏi trước.", { exact: false })).toBeVisible();
});

test("sample report identifies synthetic data", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await page.getByRole("link", { name: "Xem báo cáo minh họa" }).click();

  await expect(page).toHaveURL(/\/result\?demo=1$/, { timeout: 30_000 });
  await expect(page.getByRole("note")).toContainText("Dữ liệu minh họa.");
  await expect(page.getByRole("note")).toContainText("không phải kết quả của bạn");
  await expect(page.getByRole("heading", { name: "Các hướng chuyên ngành để bạn tham khảo" })).toBeVisible();
});
