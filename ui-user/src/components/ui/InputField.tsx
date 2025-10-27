import React from "react";
import { LucideIcon } from "lucide-react";

interface InputFieldProps {
  icon: LucideIcon;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  toggleIcon?: LucideIcon;
  onToggle?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  error,
  toggleIcon: ToggleIcon,
  onToggle,
}) => {
  return (
    <div>
      <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
        <Icon className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 outline-none bg-transparent"
        />
        {ToggleIcon && (
          <button type="button" onClick={onToggle} className="ml-2 text-gray-500">
            <ToggleIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default InputField;
