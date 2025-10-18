import React from "react";

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
  placeholder,
  id, // Destructure id
  ...rest
}) => {
  const inputId = id || label.replace(/\s+/g, "-") + "-input"; // Generate a unique ID if not provided
  return (
    <div className="labeled-input-field">
      <label htmlFor={inputId}>{label}</label>{" "}
      {/* Associate label with input */}
      <input
        id={inputId} // Assign id to input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  );
};

export default LabeledInputField;
