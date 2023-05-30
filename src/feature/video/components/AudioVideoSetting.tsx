import {
  Box,
  Grid,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import { useEffect, useState } from "react";

import DoneIcon from "@mui/icons-material/Done";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import SpeakerOutlinedIcon from "@mui/icons-material/SpeakerOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import Avatar from "./avatar";
import { CheckOutlined } from "@ant-design/icons";

import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import { CloseOutlined, VolcanoOutlined } from "@mui/icons-material";

export function AudioVideoSetting({
  onAudioVideoOption,
  setonAudioVideoOption,
  selfShareRef,
  zmClient,
  mediaStream,
  cameraList,
  activeCamera,
  speakerList,
  micList,
}: any) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60%",
    minHeight: "80%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 0,
    borderRadius: 10,
  };

  const [ActiveTabSetting, setActiveTabSetting] = useState("Audio");
  const [CameraList, setCameraList] = useState("");
  const [speakerListData, setspeakerListData] = useState("");
  const [micListData, setmicListData] = useState("");

  const participants = zmClient.getAllUser();

  useEffect(() => {
    if (onAudioVideoOption) {
      cameraList.map((e: any) => {
        if (e.deviceId == mediaStream.getActiveCamera()) {
          setCameraList(`${e.label}`);
        }
      });
      speakerList.map((e: any) => {
        if (e.deviceId == mediaStream.getActiveSpeaker()) {
          setspeakerListData(e.label);
        }
      });

      micList.map((e: any) => {
        if (e.deviceId == mediaStream.getActiveMicrophone()) {
          setmicListData(`${e.label}`);
        }
      });
      if (CameraList?.length == 0) {
        setCameraList(cameraList[0]?.label);
      }
    }
  }, [onAudioVideoOption]);

  // useEffect(() => {
  //   const stream = zmClient.getMediaStream();
  //   stream.renderVideo(
  //     document.querySelector("#participants-canvas"),
  //     participants[0].userId,
  //     960,
  //     540,
  //     0,
  //     0,
  //     3
  //   );
  // }, [onAudioVideoOption]);

  const toggleMic = (name: any) => {
    micList.map((e: any) => {
      if (e.label == name) {
        mediaStream.switchMicrophone(e.deviceId);
      }
    });
  };

  const toggleSpeaker = (name: any) => {
    speakerList.map((e: any) => {
      if (e.label == name) {
        mediaStream.switchSpeaker(e.deviceId);
      }
    });
  };

  const toggleCamera = (name: any) => {
    cameraList.map((e: any) => {
      if (e.label == name) {
        mediaStream.switchCamera(e.deviceId);
      }
    });
  };

  return (
    <>
      <Modal
        keepMounted
        open={onAudioVideoOption}
        // open={true}
        onClose={() => setonAudioVideoOption(false)}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <Grid container item>
            <Grid
              item={true}
              xs={3}
              style={{
                borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                // boxShadow: "3px 0 5px -2px #888",
                minHeight: "90vh",
              }}
            >
              <Typography variant="h5" className="p-4">
                Settings
              </Typography>
              <Box>
                <MenuItem
                  className={
                    ActiveTabSetting == "Audio"
                      ? "AudioSettingtab py-2 mr-2 pr-2"
                      : "NotActiveAudioSettingtab py-2 mr-2 pr-2"
                  }
                  onClick={() => setActiveTabSetting("Audio")}
                >
                  <SpeakerOutlinedIcon
                    className="mr-2"
                    style={{ fill: ActiveTabSetting == "Audio" ? "blue" : "" }}
                  />
                  <Typography
                    variant="subtitle1"
                    style={{
                      color: ActiveTabSetting == "Audio" ? "blue" : "",
                      fontSize: 15,
                    }}
                  >
                    Audio
                  </Typography>
                </MenuItem>
                <MenuItem
                  className={
                    ActiveTabSetting == "Video"
                      ? "AudioSettingtab py-2 mr-2 pr-2"
                      : "NotActiveAudioSettingtab py-2 mr-2"
                  }
                  onClick={() => setActiveTabSetting("Video")}
                >
                  <VideocamOutlinedIcon
                    className="mr-2"
                    style={{ fill: ActiveTabSetting == "Video" ? "blue" : "" }}
                  />
                  <Typography
                    variant="subtitle1"
                    style={{
                      color: ActiveTabSetting == "Video" ? "blue" : "",
                      fontSize: 15,
                    }}
                  >
                    Video
                  </Typography>
                </MenuItem>
              </Box>
            </Grid>
            <Grid item={true} xs={9} style={{ width: "100%" }}>
              <Box style={{ textAlign: "end" }} className="p-2">
                <IconButton onClick={() => setonAudioVideoOption(false)}>
                  <CloseOutlined />
                </IconButton>
              </Box>
              {ActiveTabSetting == "Audio" ? (
                <Box style={{ padding: "20px" }}>
                  <Typography
                    variant="subtitle1"
                    className="font-weight-bold text-primary"
                  >
                    Microphone
                  </Typography>
                  <Grid
                    container
                    item
                    style={{
                      alignItems: "center",
                    }}
                  >
                    <Grid item={true} xs={8}>
                      <Select
                        variant="outlined"
                        labelId="demo-simple-select-label"
                        className="w-100"
                        id="demo-simple-select"
                        value={micListData}
                        label="Age"
                        onChange={(e: any) => {
                          setmicListData(e.target.value);
                          toggleMic(e.target.value);
                        }}
                      >
                        {micList?.length > 0 &&
                          micList.map((item: any) => (
                            <MenuItem key={item.deviceId} value={item.label}>
                              {item.label}
                            </MenuItem>
                          ))}
                        {/* </TextField> */}
                      </Select>
                    </Grid>
                    <Grid
                      item={true}
                      xs={4}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <KeyboardVoiceIcon className="mr-2" />
                    </Grid>
                    <Box className="w-100 mt-4">
                      <Grid
                        container
                        item
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <Grid item={true} xs={8} className="mt-2">
                          <Typography
                            variant="subtitle1"
                            className="font-weight-bold"
                          >
                            Noise cancellation
                          </Typography>
                          <Typography variant="subtitle2">
                            Filters out sound from your mic that isn't speech
                          </Typography>
                        </Grid>

                        <Grid
                          item={true}
                          xs={4}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Switch
                            checkedIcon={
                              <DoneIcon
                                style={{
                                  backgroundColor: "blue",
                                  borderRadius: "50px",
                                  fill: "white",
                                  fontSize: 20,
                                  padding: 3,
                                  fontWeight: "bold",
                                }}
                              />
                            }
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    <Box className="w-100 mt-4">
                      <Typography
                        variant="subtitle1"
                        className="font-weight-bold text-primary"
                      >
                        Speakers
                      </Typography>
                      <Grid
                        container
                        item
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <Grid item={true} xs={8} className="mt-2">
                          <Select
                            variant="outlined"
                            labelId="demo-simple-select-label"
                            className="w-100"
                            id="demo-simple-select"
                            value={speakerListData}
                            label="Age"
                            onChange={(e: any) => {
                              setspeakerListData(e.target.value);
                              toggleSpeaker(e.target.value);
                            }}
                          >
                            {speakerList?.length > 0 &&
                              speakerList.map((item: any) => (
                                <MenuItem
                                  key={item.deviceId}
                                  value={item.label}
                                >
                                  {item.label}
                                </MenuItem>
                              ))}
                            {/* </TextField> */}
                          </Select>
                        </Grid>

                        <Grid
                          item={true}
                          xs={4}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <VolumeUpOutlinedIcon className="mr-2" />
                          <Typography
                            variant="body2"
                            className="text-secondary font-weight-bold"
                          >
                            Test
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Box>
              ) : (
                <Box style={{ padding: "20px" }}>
                  <Typography
                    variant="subtitle1"
                    className="font-weight-bold text-primary"
                  >
                    Camera
                  </Typography>
                  <Grid
                    container
                    item
                    style={{
                      alignItems: "center",
                    }}
                  >
                    <Grid item={true} xs={8}>
                      {/* <TextField
                        style={{ width: "100%" }}
                        variant="outlined"
                        value={`jhbjhb`}
                        // onChange={(e) => setValue(e.target.value)}
                        onChange={(e: any) => setCameraList(e.target.value)}
                        select
                        label=""
                        size="medium"
                      > */}
                      <Select
                        variant="outlined"
                        labelId="demo-simple-select-label"
                        className="w-100"
                        id="demo-simple-select"
                        value={CameraList}
                        label="Age"
                        onChange={(e: any) => {
                          setCameraList(e.target.value);
                          toggleCamera(e.target.value);
                        }}
                      >
                        {cameraList?.length > 0 &&
                          cameraList.map((item: any) => (
                            <MenuItem key={item.deviceId} value={item.label}>
                              {item.label}
                            </MenuItem>
                          ))}
                        {/* </TextField> */}
                      </Select>
                    </Grid>
                    <Grid
                      item={true}
                      xs={4}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div className="">
                        <canvas
                          id="participants-canvas"
                          width="100"
                          height="60"
                          ref={selfShareRef}
                        ></canvas>
                        {/* <ul className="avatar-list">
                          {participants?.map((user: any, index: any) => {
                            // if (index > videoLayout.length - 1) {
                            //   return null;
                            // }
                            // const dimension = videoLayout[index];
                            // const { width, height, x, y } = dimension;
                            // const { height: canvasHeight } = canvasDimension;
                            return (
                              <Avatar
                                participant={user}
                                key={user.userId}
                                isActive={user.userId === user.userId}
                                style={{
                                  width: `50px`,
                                  height: `50px`,
                                  top: `50px`,
                                  left: `50px`,
                                  backgroundColor: "black",
                                }}
                              />
                            );
                          })}
                        </ul> */}
                      </div>
                    </Grid>
                    <Box className="w-100 mt-4">
                      <Grid
                        container
                        item
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <Grid item={true} xs={8} className="mt-2">
                          <Typography
                            variant="subtitle1"
                            className="font-weight-bold"
                          >
                            Adjust video lighting
                          </Typography>
                          <Typography variant="subtitle2">
                            Makes it easier to see you against a bright
                            background
                          </Typography>
                        </Grid>

                        <Grid
                          item={true}
                          xs={4}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Switch
                            icon={
                              <RemoveOutlinedIcon
                                style={{
                                  backgroundColor: "#3d3a3a",
                                  borderRadius: "50px",
                                  fill: "white",
                                  fontSize: 20,
                                  padding: 3,
                                  fontWeight: "bold",
                                }}
                              />
                            }
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    {/* <Box className="w-100 mt-4">
                      <Typography
                        variant="subtitle1"
                        className="font-weight-bold text-primary"
                      >
                        Send resolution (maximize)
                      </Typography>
                      <Grid
                        container
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <Grid xs={8} className="mt-2">
                          <TextField
                            style={{ width: "100%" }}
                            variant="outlined"
                            value={"value"}
                            // onChange={(e) => setValue(e.target.value)}
                            select
                            label=""
                            size="medium"
                          >
                            <MenuItem key={1} value="test">
                              Test 1
                            </MenuItem>
                            <MenuItem key={2} value="test2">
                              Test 2
                            </MenuItem>
                          </TextField>
                        </Grid>
                      </Grid>
                    </Box> */}
                    {/* <Box className="w-100 mt-4">
                      <Typography
                        variant="subtitle1"
                        className="font-weight-bold text-primary"
                      >
                        Receive resolution (maximize)
                      </Typography>
                      <Grid
                        container
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <Grid xs={8} className="mt-2">
                          <TextField
                            style={{ width: "100%" }}
                            variant="outlined"
                            value={"value"}
                            // onChange={(e) => setValue(e.target.value)}
                            select
                            label=""
                            size="medium"
                          >
                            <MenuItem key={1} value="test">
                              Test 1
                            </MenuItem>
                            <MenuItem key={2} value="test2">
                              Test 2
                            </MenuItem>
                          </TextField>
                        </Grid>
                      </Grid>
                    </Box> */}
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}
