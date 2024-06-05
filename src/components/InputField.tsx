import React from "react";
import { Box, TextField } from "@mui/material";

const InputField = ({ tag, value, onChange, placeholder, ...props }) => {
  return (
    <Box pt={4} sx={{ width: "100%", maxWidth: 225 }} {...props}>
      <TextField
        label={tag}
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
