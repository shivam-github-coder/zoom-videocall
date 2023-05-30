import {
  Button,
  Grid,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Modal,
  Box,
  IconButton,
  Alert,
  Slide,
  Switch
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import LinkIcon from '@mui/icons-material/Link';
import HomepagePhoto from '../../assets/homepagePhoto.jpg';
//   import { useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import Header from '../../component/pages/Header';
import { RouteComponentProps } from 'react-router-dom';
import '../../index.css';
import { devConfig, topicInfo } from '../../config/dev';
import { getQueryString } from '../../Api';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import chromeImage from '../../assets/chrome.png';
import DoneIcon from '@mui/icons-material/Done';
import { url } from '../../App';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #fff',
  boxShadow: 24,
  p: 2
};

function KeepMountedModal({ setOpenModal, openModal }: any) {
  const handleClose = () => setOpenModal(false);
  const [copyLinkDone, setcopyLinkDone] = useState(false);

  const copyLink = () => {
    setcopyLinkDone(true);
    navigator.clipboard.writeText(url);
    setTimeout(() => {
      setcopyLinkDone(false);
    }, 2000);
  };

  return (
    <>
      <Modal
        keepMounted
        open={openModal}
        onClose={handleClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <Box className="d-flex justify-content-between align-items-center">
            <Typography
              style={{
                fontSize: '20px',
                fontWeight: 600,
                lineHeight: '43.3px',
                color: 'black'
              }}
            >
              Hear's the link of your meeting
            </Typography>

            <IconButton onClick={handleClose}>
              <CloseIcon className="cursor-pointer" />
            </IconButton>
          </Box>
          <Typography variant="h6" fontSize={18}>
            Copy this link and send it to people you want to meet with. Be sure to save it so you can use it later, too.
          </Typography>
          <Box className="d-flex justify-content-between align-items-center bg-light px-2 my-3 rounded mb-5 ">
            <p id="copyInput">{url?.length > 35 ? url.slice(0, 35) + '...' : url}</p>
            <IconButton onClick={copyLink}>
              <ContentCopyIcon className="cursor-pointer" />
            </IconButton>
          </Box>
        </Box>
      </Modal>
      <Snackbar open={copyLinkDone} message="Copied meeting link" key={'bottom' + 'left'} />
    </>
  );
}

interface HomeProps extends RouteComponentProps {
  status: string;
  init: any;
}

const Homepage: React.FunctionComponent<HomeProps> = (props) => {
  const { history, status, init } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  // const navigate = useNavigate();
  const [openModal, setOpenModal] = React.useState(false);
  const [SupportBrowser, setSupportBrowser] = useState<any>(null);

  useEffect(() => {
    function fnBrowserDetect() {
      let userAgent = navigator.userAgent;

      if (userAgent.match(/chrome|chromium|crios/i)) {
        setSupportBrowser(null);
      } else if (userAgent.match(/firefox|fxios/i)) {
        setSupportBrowser('firefox');
      } else if (userAgent.match(/safari/i)) {
        setSupportBrowser('safari');
      } else if (userAgent.match(/opr\//i)) {
        setSupportBrowser('opera');
      } else if (userAgent.match(/edg/i)) {
        setSupportBrowser('edge');
      }
    }
    fnBrowserDetect();
  }, []);

  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    if (SupportBrowser) {
      setTimeout(() => {
        setSupportBrowser(null);
      }, 10000);
    }
  }, [SupportBrowser]);

  const { enqueueSnackbar } = useSnackbar();

  const handleClickVariant = (variant: any, data: String) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar(data ? data : 'Joined Successfully', { variant });
  };

  const startSession = async () => {
    history.push(`/Join`);
  };

  const createSession = () => {
    setOpenModal(true);
    setAnchorEl(null);
  };

  return (
    <>
      <Header />

      {SupportBrowser && (
        <Slide direction="down" in={SupportBrowser ? true : false}>
          <Alert severity="error">
            Your {SupportBrowser} browser is not supported by TalkPlayground at this time. Please change to Chrome
            browser to use TalkPlayground.
          </Alert>
        </Slide>
      )}

      <KeepMountedModal setOpenModal={setOpenModal} openModal={openModal} />
      <Grid className="d-flex justify-content-center  h-auto">
        <Grid container item xs={12} md={11} className="my-5 py-4 ">
          <Grid item={true} xs={12} md={6} order={{ xs: 2, md: 0 }} className=" text-left">
            <Typography
              style={{
                fontSize: '32px',
                fontWeight: 500,
                lineHeight: '43.3px',
                color: 'black'
              }}
              className="pt-2 px-5"
            >
              The video platform for connection.
            </Typography>
            <Typography
              style={{
                fontSize: '32px',
                fontWeight: 500,
                lineHeight: '43.3px',
                color: 'black'
              }}
              className="px-5"
            >
              Free and available for all.
            </Typography>
            <Typography
              style={{
                fontSize: '22px',
                fontWeight: 300,
                lineHeight: '31.51px'
              }}
              className="pb-4 pt-1 px-5 bg-red-600"
            >
              Designed specifically for building emotional <br /> awareness. Free and available for all.
            </Typography>
            <Box className="mt-3 pb-10 px-5">
              <Button
                id="demo-positioned-button"
                aria-controls={open ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                startIcon={<VideocamOutlinedIcon />}
                variant="contained"
                style={{ backgroundColor: '#494CE2', color: '#fff' }}
              >
                <span className="text-capitalize">New Meeting</span>
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left'
                }}
                style={{ marginLeft: '38px' }}
              >
                <MenuItem onClick={startSession} className="py-1 mb-1">
                  <VideocamOutlinedIcon className="mr-2" />
                  <ListItemText primary={<span className="capitalize text-xs">Start a session now</span>} />
                </MenuItem>
                <MenuItem onClick={createSession} className="py-1">
                  <LinkIcon className="mr-2" />
                  <ListItemText primary={<span className="capitalize text-xs">Create a session for later</span>} />
                </MenuItem>
              </Menu>
            </Box>
            <Box className="d-flex align-items-center pt-3">
              <Typography className="text-secondary pl-5" style={{ fontSize: '15px' }}>
                Recommended Browser
              </Typography>
              <img src={chromeImage} width="25" alt="recomended" className="mx-2" />
            </Box>

            <Divider className="ml-5 mt-3" />
            <Typography className="pt-3 px-5" style={{ fontSize: '15px' }}>
              <span className="LearnMore pr-1" style={{ color: '#494CE2' }}>
                Learn more
              </span>
              about Playground
            </Typography>
          </Grid>
          <Grid item={true} xs={12} md={6}>
            <img className="rounded HomepagePhoto" src={HomepagePhoto} alt="HomepagePhoto" />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Homepage;
