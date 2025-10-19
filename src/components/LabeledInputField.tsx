import React, { useId } from "react";

interface LabeledInputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LabeledInputField: React.FC<LabeledInputFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  id: providedId,
  ...rest
}) => {
  const generatedId = useId();
  const inputId = providedId || generatedId;
  return (
    <div className="labeled-input-field">
      <label htmlFor={inputId}>{label}</label>{" "}
      {/* Associate label with input */}
      <input
        id={inputId} // Assign id to input
        type={type}
        value={value}
        onChange={onChange}
        {...rest}
      />
    </div>
  );
};

export default LabeledInputField;
