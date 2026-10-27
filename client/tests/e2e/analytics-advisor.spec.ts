import { expect, test } from '@playwright/test';

test('demo radar has a numeric table under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/result?demo=1');
  const table = page.getByRole('table', { name: /So sánh năng lực/ });
  await expect(table).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Hiện tại', exact: true })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Chuẩn ngành', exact: true })).toBeVisible();
  expect(await table.getByRole('row').count()).toBeGreaterThan(1);
  await expect(page.getByRole('note')).toContainText('Dữ liệu minh họa');
});

test('chat retains partial text when a mocked stream ends before DONE', async ({ page }) => {
  const assistantWrites: unknown[] = [];
  await page.addInitScript(() => {
    const user = { id: 'synthetic', studentId: 'TEST-SYNTHETIC', name: 'Synthetic Learner', email: 'test@example.test' };
    localStorage.setItem('majormatch_auth_token', 'synthetic-test-token');
    localStorage.setItem('majormatch_auth_user', JSON.stringify(user));
    localStorage.setItem('majormatch-profile-storage', JSON.stringify({ version: 0, state: {
      profile: { student_id: user.studentId, full_name: user.name, cumulative_gpa: 3, total_credits: 0, courses: [], detected_skills: [] },
      riasecAnswers: {}, selectedCareerTags: [],
    } }));
  });
  // Every API call is intercepted. This test never contacts EC2 or a real model.
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/chat/stream')) {
      await route.fulfill({ status: 200, contentType: 'text/event-stream', body: 'data: {"token":"Synthetic partial answer"}\n\n' });
    } else if (path.includes('/chat/history/')) {
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON();
        if (payload.role === 'assistant') assistantWrites.push(payload);
      }
      await route.fulfill({ json: { messages: [] } });
    } else if (path.endsWith('/health')) {
      await route.fulfill({ json: { status: 'online', private_compute_node: { ollama_status: 'online' } } });
    } else {
      await route.fulfill({ json: { sessions: [] } });
    }
  });
  await page.goto('/chat');
  const input = page.getByPlaceholder('Nhắn tin cho Cố vấn AI MajorMatch...');
  await expect(input).toBeEnabled();
  await input.fill('Synthetic question');
  await page.getByTitle('Gửi tin nhắn').click();
  await expect(page.getByText('Synthetic partial answer', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('kết nối kết thúc trước khi hoàn tất');
  await expect(input).toBeEnabled();
  expect(assistantWrites).toEqual([]);
});
