import React from "react";
import { Box, InputLabel, FormControl, Select, MenuItem } from "@mui/material";

const SelectInput = ({ label, value, onChange, options }) => {
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
