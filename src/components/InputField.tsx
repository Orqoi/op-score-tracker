import React from "react";
import { Box, TextField, type BoxProps, type TextFieldProps } from "@mui/material";

const InputField: React.FC<TextFieldProps & BoxProps> = ({ label, value, onChange, placeholder, ...props }) => {
  return (
    <Box pt={4} sx={{ width: "100%", maxWidth: 225 }} {...props}>
      <TextField
        label={label}
        onChange={onChange}
        value={value}
        fullWidth
        focused
        placeholder={placeholder}
      />
    </Box>
  );
};

export default InputField;
