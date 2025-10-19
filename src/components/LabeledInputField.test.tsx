import { render, screen, fireEvent } from "@testing-library/react";
import LabeledInputField from "./LabeledInputField";
import { vi } from "vitest";

describe("LabeledInputField", () => {
  const defaultProps = {
    label: "Test Label",
    value: "Test Value",
    onChange: vi.fn(),
  };

  it("ラベルと入力が正しくレンダリングされること", () => {
    render(<LabeledInputField {...defaultProps} />);
    expect(screen.getByLabelText(defaultProps.label)).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultProps.value)).toBeInTheDocument();
  });

  it("入力値が変更されたときにonChangeが呼び出されること", () => {
    render(<LabeledInputField {...defaultProps} />);
    const inputElement = screen.getByLabelText(defaultProps.label);
    fireEvent.change(inputElement, { target: { value: "New Value" } });
    expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
  });

  it("入力に正しいタイプが適用されること", () => {
    render(<LabeledInputField {...defaultProps} type="password" />);
    expect(screen.getByLabelText(defaultProps.label)).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("入力にプレースホルダーが適用されること", () => {
    const placeholderText = "Enter something";
    render(
      <LabeledInputField {...defaultProps} placeholder={placeholderText} />
    );
    expect(screen.getByPlaceholderText(placeholderText)).toBeInTheDocument();
  });

  it("指定されたidがinputとlabelに適用されること", () => {
    const customId = "custom-input-id";
    render(<LabeledInputField {...defaultProps} id={customId} />);

    const inputElement = screen.getByLabelText(defaultProps.label);
    expect(inputElement).toHaveAttribute("id", customId);
  });
});
