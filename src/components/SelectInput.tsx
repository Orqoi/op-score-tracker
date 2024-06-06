import React from "react";
import { Box, InputLabel, FormControl, Select, MenuItem, type SelectChangeEvent } from "@mui/material";

// Define the type for the options prop
interface Option {
  value: string;
  label: string;
}

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  options: Option[];
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options }) => {
  return (
    <Box pt={4} minWidth={275}>
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select value={value} label={label} onChange={onChange}>
          {options.map((option, index) => (
            <MenuItem key={index} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SelectInput;