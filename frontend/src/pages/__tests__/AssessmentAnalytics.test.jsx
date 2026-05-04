import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { rest } from "msw";
import { server } from "../../test/server";
import { MemoryRouter } from "react-router-dom";
import AssessmentAnalytics from "../AssessmentAnalytics";

const renderPage = () =>
  render(
    <MemoryRouter>
      <AssessmentAnalytics />
    </MemoryRouter>
  );

test("renders analytics page and loads summary data", async () => {
  renderPage();

  expect(await screen.findByText(/Outcome-Based Analytics/i)).toBeInTheDocument();
  expect(await screen.findByText(/Select Course/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/Cumulative Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/133 \/ 200/)).toBeInTheDocument();
  });
});

test("shows error state when analytics API fails", async () => {
  server.use(
    rest.get("*/analytics/all/clo/", (req, res, ctx) => res(ctx.status(500)))
  );

  renderPage();

  await waitFor(() => expect(screen.getByText(/Failed to load CLO analytics/i)).toBeInTheDocument());
});

test("changes course selection and reloads course-specific analytics", async () => {
  renderPage();

  await waitFor(() => expect(screen.getByText(/All Courses/i)).toBeInTheDocument());

  fireEvent.click(screen.getByRole("button", { name: /All Courses/i }));
  fireEvent.click(screen.getByText(/ENG201 - Advanced Writing/i));

  await waitFor(() => expect(screen.getByText(/90 \/ 100/)).toBeInTheDocument());
  expect(screen.getByText(/Cumulative Score:/i)).toBeInTheDocument();
});
