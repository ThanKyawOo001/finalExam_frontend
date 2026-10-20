//src/components/StatusChip.jsx

import Chip from "@mui/material/Chip";

const STATUS_COLOR = { Open: "success", Close: "warning", Cancel: "error" };

export default function StatusChip({ status }) {
  return (
    <Chip size="small" label={status} color={STATUS_COLOR[status] || "default"} />
  );
}
