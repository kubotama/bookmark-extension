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
    <>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        className={rest.className}
        {...rest}
      />
    </>
  );
};

export default LabeledInputField;
