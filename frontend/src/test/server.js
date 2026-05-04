import { beforeAll, afterEach, afterAll } from "vitest";
import { rest } from "msw";
import { setupServer } from "msw/node";

const handlers = [
  rest.get("*/courses/", (req, res, ctx) =>
    res(
      ctx.json([
        { id: 1, code: "CS101", title: "Intro to Programming" },
        { id: 2, code: "ENG201", title: "Advanced Writing" },
      ])
    )
  ),

  rest.get("*/users/dashboard-data/", (req, res, ctx) =>
    res(ctx.json({ courses: [] }))
  ),

  rest.get("*/analytics/all/clo/", (req, res, ctx) =>
    res(
      ctx.json({
        clo_chart: [
          { clo: "CLO1", percent: 78, obtained: 78, possible: 100 },
          { clo: "CLO2", percent: 55, obtained: 55, possible: 100 },
        ],
        total_obtained: 133,
        total_possible: 200,
      })
    )
  ),

  rest.get("*/courses/:courseId/analytics/clo/", (req, res, ctx) =>
    res(
      ctx.json({
        clo_chart: [
          { clo: "CLO1", percent: 90, obtained: 90, possible: 100 },
        ],
        total_obtained: 90,
        total_possible: 100,
      })
    )
  ),

  rest.post("*/grading/grade/", async (req, res, ctx) =>
    res(
      ctx.json({
        data: {
          id: 123,
          student_name: "Alice Test",
          cms_id: "CMS123",
          summary: { total_obtained: 80, total_possible: 100 },
          per_question: {
            Q1: {
              question: "What is OBE?",
              student_answer: "Outcome-based education.",
              feedback: "Good answer.",
              marks_awarded: 8,
              max_marks: 10,
            },
          },
        },
      })
    )
  ),
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
export { rest };
