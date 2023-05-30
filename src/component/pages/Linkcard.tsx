import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { devConfig } from "../../config/dev";
import { url } from "../../App";

export default function BasicCard({
  setLinkShowCard,
  LinkShowCard,
  DisplayDataInfo,
}: any) {
  const cardOpen = () => {
    setLinkShowCard(!LinkShowCard);
  };

  return (
    <Box
      className="position-absolute"
      style={{
        bottom: "80px",
        right: "30px",
        zIndex: 10,
        textAlign: "left",
      }}
    >
      <Card sx={{ minWidth: 275, borderRadius: 4 }}>
        <CardContent>
          <Box className="d-flex align-items-center justify-content-between">
            <p style={{ fontSize: 18, fontWeight: "bold", color: "black" }}>
              Your meeting's ready
            </p>
            <IconButton onClick={cardOpen}>
              <CloseIcon className="cursor-pointer" />
            </IconButton>
          </Box>
          <p style={{ fontSize: 14 }}>
            Or share this joining info with others you want in
            <br /> the meeting
          </p>
          <Box className="d-flex bg-secondary text-white px-2 mt-3 rounded justify-content-between align-items-center ">
            <p>{url?.length > 38 ? url.slice(0, 38) + "..." : url}</p>

            <IconButton onClick={() => navigator.clipboard.writeText(url)}>
              <ContentCopyIcon
                style={{ fill: "white" }}
                className="cursor-pointer"
              />
            </IconButton>
          </Box>
        </CardContent>
        <CardActions>
          <p style={{ fontSize: 12 }} className="text-secondary pl-2 mb-4">
            Joined as {DisplayDataInfo.emailinfo}
          </p>
        </CardActions>
      </Card>
    </Box>
  );
}
