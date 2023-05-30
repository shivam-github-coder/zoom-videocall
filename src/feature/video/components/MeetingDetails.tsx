import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@material-ui/core";
import { CloseSharp } from "@mui/icons-material";
import React from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { devConfig } from "../../../config/dev";

function MeetingDetails({ modalOpenClose }: any) {
  const url = `${window.location.origin}/video?topic=${devConfig.topic}`;
  return (
    <Card
      style={{
        display: modalOpenClose ? "block" : "none",
        width: "30vw",
      }}
    >
      <CardContent>
        <Box className="d-flex justify-content-between align-item-center">
          <Typography variant="h6" className="fw-bold">
            Meeting details
          </Typography>
          <CloseSharp />
        </Box>
        <Box className="text-left mt-5">
          <Typography variant="inherit" className="text-secondary">
            Joining info
          </Typography>
          <Box className="d-flex bg-secondary text-white px-2 mt-3 rounded justify-content-between align-items-center ">
            <p>{url?.length > 38 ? url.slice(0, 38) + "..." : url}</p>

            <IconButton onClick={() => navigator.clipboard.writeText(url)}>
              <ContentCopyIcon
                style={{ fill: "white" }}
                className="cursor-pointer"
              />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default MeetingDetails;
