import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { rest } from "msw";
import { server } from "../../test/server";
import { MemoryRouter } from "react-router-dom";
import AssessmentGrading from "../AssessmentGrading";
import { GradingProvider } from "../../contexts/GradingContext";

beforeEach(() => {
  localStorage.clear();
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <GradingProvider>
        <AssessmentGrading />
      </GradingProvider>
    </MemoryRouter>
  );

test("validates grade form before submission", async () => {
  const { container } = renderPage();

  await waitFor(() => expect(screen.getByText(/Select Course/i)).toBeInTheDocument());
  const form = container.querySelector("form");
  form.noValidate = true;

  const fileInputs = container.querySelectorAll('input[type="file"]');
  const studentFile = new File(["student content"], "student.pdf", { type: "application/pdf" });
  fireEvent.change(fileInputs[0], { target: { files: [studentFile] } });

  fireEvent.click(screen.getByRole("button", { name: /Start Grading/i }));
  expect(await screen.findByText(/Please select a course\./i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Choose a Course/i }));
  fireEvent.click(screen.getByText(/CS101 - Intro to Programming/i));

  fireEvent.click(screen.getByRole("button", { name: /Start Grading/i }));
  expect(await screen.findByText(/Please upload both the student submission and the rubric\./i)).toBeInTheDocument();
});

test("submits grading form and renders results", async () => {
  server.use(
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
    )
  );

  const { container } = renderPage();

  await waitFor(() => expect(screen.getByText(/Select Course/i)).toBeInTheDocument());
  const form = container.querySelector("form");
  form.noValidate = true;

  fireEvent.click(screen.getByRole("button", { name: /Choose a Course/i }));
  fireEvent.click(screen.getByText(/CS101 - Intro to Programming/i));

  const fileInputs = container.querySelectorAll('input[type="file"]');
  const studentFile = new File(["student content"], "student.pdf", { type: "application/pdf" });
  const rubricFile = new File(["rubric content"], "rubric.pdf", { type: "application/pdf" });

  fireEvent.change(fileInputs[0], { target: { files: [studentFile] } });
  fireEvent.change(fileInputs[1], { target: { files: [rubricFile] } });

  fireEvent.click(screen.getByRole("button", { name: /Start Grading/i }));

  await waitFor(() => expect(screen.getByText(/Grading Results/i)).toBeInTheDocument());
  expect(screen.getByText(/Alice Test/i)).toBeInTheDocument();
  expect(screen.getByText(/80 \/ 100/i)).toBeInTheDocument();
});

test("resets grading view after result display", async () => {
  const { container } = renderPage();

  await waitFor(() => expect(screen.getByText(/Select Course/i)).toBeInTheDocument());
  const form = container.querySelector("form");
  form.noValidate = true;
  fireEvent.click(screen.getByRole("button", { name: /Choose a Course/i }));
  fireEvent.click(screen.getByText(/CS101 - Intro to Programming/i));

  const fileInputs = container.querySelectorAll('input[type="file"]');
  const studentFile = new File(["student content"], "student.pdf", { type: "application/pdf" });
  const rubricFile = new File(["rubric content"], "rubric.pdf", { type: "application/pdf" });
  fireEvent.change(fileInputs[0], { target: { files: [studentFile] } });
  fireEvent.change(fileInputs[1], { target: { files: [rubricFile] } });

  fireEvent.click(screen.getByRole("button", { name: /Start Grading/i }));

  await waitFor(() => expect(screen.getByText(/Grading Results/i)).toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: /Grade New \+/i }));

  expect(screen.getByRole("button", { name: /Start Grading/i })).toBeInTheDocument();
});
