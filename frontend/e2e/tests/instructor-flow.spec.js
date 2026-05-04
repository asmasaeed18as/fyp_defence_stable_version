import { test, expect } from '@playwright/test';

const instructorToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6Imluc3RydWN0b3JAZXhhbXBsZS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImZpcnN0X25hbWUiOiJKYW5lIiwibGFzdF9uYW1lIjoiRG9lIn0.';

const apiMock = {
  loginResponse: {
    user_id: 1,
    email: 'instructor@example.com',
    first_name: 'Jane',
    last_name: 'Doe',
    role: 'instructor',
  },
  dashboardData: {
    courses: [
      { course_id: 1, title: 'CS101 - Intro to Programming', code: 'CS101', section_name: 'A', instructor: 'Jane Doe' },
    ],
    user_name: 'Jane Doe',
    role: 'instructor',
  },
  coursesResponse: [
    { id: 1, title: 'Intro to Programming', code: 'CS101' },
  ],
  courseClos: [
    { id: 1, code: 'CLO1', description: 'Understand basic programming concepts', domain: 'C2', bloom_level: 'C2' },
  ],
  generateResponse: {
    id: 100,
    title: 'Sample Generated Assessment',
    result_json: {
      questions: [
        { id: 1, question: 'Sample Q1: Explain the OBE assessment approach.', marks: 10, meta: { clo: 'CLO1', bloom: 'C2', difficulty: 'Medium' } },
      ],
    },
  },
  analyticsResponse: {
    clo_chart: [{ clo: 'CLO1', obtained: 30, possible: 40, percent: 75 }],
    total_obtained: 30,
    total_possible: 40,
  },
  gradingResponse: {
    id: 10,
    student_name: 'Test Student',
    cms_id: '123456',
    summary: { total_obtained: 8, total_possible: 10 },
    per_question: {
      'Q1': { question: 'Explain OBE.', max_marks: 10, marks_awarded: 8, student_answer: 'OBE focuses on outcomes.', feedback: 'Good.' }
    }
  }
};

test.describe('Instructor full e2e flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/users/login/', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access: instructorToken, refresh: instructorToken, user: apiMock.loginResponse }),
      })
    );

    await page.route('**/users/dashboard-data/', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiMock.dashboardData),
      })
    );

    await page.route('**/courses/1/clos/', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiMock.courseClos),
      })
    );

    await page.route('**/courses/', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiMock.coursesResponse),
      })
    );

    await page.route('**/assessment/generate/', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiMock.generateResponse),
      })
    );

    await page.route('**/analytics/all/clo/', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiMock.analyticsResponse),
      })
    );

    await page.route('**/grading/grade/', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: apiMock.gradingResponse }),
      })
    );
  });

  test('logs in, navigates to assessment creation, generates an assessment, and views analytics', async ({ page }) => {
    await page.goto('/');
    await page.fill('#login-email', 'instructor@example.com');
    await page.fill('#login-password', 'password');

    await Promise.all([
      page.waitForResponse('**/users/login/'),
      page.click('button:has-text("Sign In")'),
    ]);

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: /Professor Jane/i })).toBeVisible();

    await page.click('text=Assessments');
    await expect(page).toHaveURL(/dashboard\/create-assessment/);

    await page.click('button:has-text("Choose a Course")');
    await page.waitForSelector('button.themed-select-option:has-text("CS101 - Intro to Programming")', { state: 'visible', timeout: 10000 });
    await page.click('button.themed-select-option:has-text("CS101 - Intro to Programming")');
    await page.click('button:has-text("Assessment Type")');
    await page.click('button.themed-select-option:has-text("Quiz/MCQs")');

    await page.fill('input[placeholder="Number of questions"]', '1');

    // Scroll the question row into view so the CLO dropdown portal stays in viewport
    await page.locator('.question-row').first().scrollIntoViewIfNeeded();

    await page.waitForSelector('button:has-text("CLO")', { state: 'visible', timeout: 10000 });
    await page.click('button:has-text("CLO")');
    await page.waitForSelector('button.themed-select-option:has-text("CLO1 (C2)")', { state: 'visible', timeout: 10000 });
    await page.locator('button.themed-select-option:has-text("CLO1 (C2)")').click({ force: true });

    await page.click('button:has-text("Enter Topic")');
    await page.fill('textarea[placeholder="Enter topic or instructions..."]', 'Write a short assessment on OBE principles.');
    await page.click('button:has-text("Generate Assessment")');

    await expect(page.getByText('Assessment generated successfully.')).toBeVisible();
    await expect(page.getByText('Sample Q1')).toBeVisible();

    await page.click('text=Analytics');
    await expect(page).toHaveURL(/dashboard\/analytics/);
    await expect(page.getByRole('heading', { name: /Outcome-Based Analytics/i })).toBeVisible();
    await expect(page.locator('.score-summary-badge')).toContainText('30 / 40');

    // GRADING FLOW
    await page.click('text=Grading');
    await expect(page).toHaveURL(/dashboard\/grading/);
    await expect(page.getByRole('heading', { name: /AI Assessment Grading/i })).toBeVisible();

    await page.click('button:has-text("Choose a Course")');
    await page.waitForSelector('button.themed-select-option:has-text("CS101 - Intro to Programming")', { state: 'visible', timeout: 10000 });
    await page.locator('button.themed-select-option:has-text("CS101 - Intro to Programming")').click({ force: true });

    // Upload dummy files for grading
    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.nth(0).setInputFiles({
      name: 'student_submission.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy content')
    });
    
    await fileInputs.nth(1).setInputFiles({
      name: 'rubric.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy rubric')
    });

    await page.click('button:has-text("Start Grading")');

    // Wait for grading results
    await expect(page.getByRole('heading', { name: /Grading Results/i })).toBeVisible();
    await expect(page.getByText('Test Student')).toBeVisible();
    await expect(page.getByText('8 / 10 Marks')).toBeVisible();
  });
});
