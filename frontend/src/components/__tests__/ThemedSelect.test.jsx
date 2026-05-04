import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import ThemedSelect from "../ThemedSelect";

function ControlledSelect({ options }) {
  const [value, setValue] = useState("");
  return (
    <ThemedSelect
      value={value}
      onChange={(e) => setValue(e.target.value)}
      options={options}
      placeholder="Pick an option"
    />
  );
}

test("renders options and calls onChange when selecting an option", () => {
  const options = [
    { value: "one", label: "One" },
    { value: "two", label: "Two" },
  ];

  render(<ControlledSelect options={options} />);

  const trigger = screen.getByRole("button", { name: /pick an option/i });
  fireEvent.click(trigger);

  const optionButton = screen.getByRole("button", { name: /Two/i });
  fireEvent.click(optionButton);

  expect(screen.getByRole("button", { name: /Two/i })).toBeInTheDocument();
});
