import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { Grid, Typography, Box, makeStyles, Checkbox } from '@material-ui/core';
import { Alert, Button, IconButton, Tooltip } from '@mui/material';

import AcUnitIcon from '@mui/icons-material/AcUnit';
import TextField from '@mui/material/TextField';
import SettingsIcon from '@mui/icons-material/Settings';
import Snackbar from '@mui/material/Snackbar';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Header from '../../component/pages/Header';
import HeaderIcon from '../../assets/app_image.png';
import { RouteComponentProps, useLocation } from 'react-router-dom';
import { devConfig } from '../../config/dev';
import { generateVideoToken } from '../../utils/util';
import ZoomVideo, { ConnectionState } from '@zoom/videosdk';
import zoomContext from '../../context/zoom-context';
import { ChatClient, MediaStream } from '../../index-types';
import { message, Modal } from 'antd';
import produce from 'immer';
import LoadingLayer from '../../component/loading-layer';
import './Joinpage.scss';
// import OtpInput from 'react-otp-input';
import { transform } from 'lodash';
import axios from 'axios';
import { Apis, getQueryString } from '../../Api';
import { useSnackbar } from 'notistack';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';

import Slide from '@mui/material/Slide';
import { url } from '../../App';
import mobile from 'is-mobile';
import { isAndroidOrIOSBrowser } from '../../utils/platform';

interface JoinProps extends RouteComponentProps {
  status: string;
  init: any;
  DisplayDataInfo: any;
  setDisplayDataInfo: any;
  setIsLoading: Function;
  setSaveTranscript: any;
  SaveTranscript: any;
}

const useStyles = makeStyles((theme) => ({
  root: {
    '&.css-1eqdgzv-MuiPaper-root-MuiSnackbarContent-root': {
      padding: '0px 16px',
      color: '#919499',
      backgroundColor: '#fff'
    }
  }
}));

const Joinpage: React.FunctionComponent<JoinProps> = (props) => {
  const { history, init, setDisplayDataInfo, DisplayDataInfo, setIsLoading, setSaveTranscript, SaveTranscript } = props;
  const [openToast, setopenToast] = useState(false);
  const [nameValidation, setnameValidation] = useState(false);
  const [emailValidate, setemailValidate] = useState(false);
  const [OTP, setOTP] = useState('');
  const [StartSession, setStartSession] = useState(false);

  const classes = useStyles();

  useEffect(() => {
    setTimeout(() => {
      setopenToast(true);
    }, 2000);
  }, []);

  function DisplayNameData(e: any) {
    setDisplayDataInfo({ ...DisplayDataInfo, [e.target.name]: e.target.value });
    setUrlShowJoin(false);
    setemailValidate(false);
    setnameValidation(false);
  }

  // const user = supabase.auth.user();

  // useEffect(() => {
  //   if (user) {
  //     setDisplayDataInfo({
  //       Displayname: `${user?.user_metadata?.fullname ? user?.user_metadata?.fullname : ''}`,
  //       emailinfo: `${user.email}`
  //     });
  //   }
  // }, [user]);

  const [UrlShowJoin, setUrlShowJoin] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  var isMobile = mobile();

  const handleClickVariant = (variant: any) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar('Joined Successfully', {
      variant,
      anchorOrigin: { horizontal: 'left', vertical: isAndroidOrIOSBrowser() ? 'top' : 'bottom' }
    });
  };

  const zmClient = useContext(zoomContext);

  const onSubmitForm = async (e: any, type: any) => {
    e.preventDefault();
    setStartSession(true);
    const info = {
      ...zmClient.getSessionInfo()
    };
    if (DisplayDataInfo.Displayname) {
      setIsLoading(true);
      await axios
        .post(
          '/api/v1/user/session/join' +
            '?' +
            getQueryString({
              name: DisplayDataInfo.Displayname,
              email: DisplayDataInfo.emailinfo
            })
        )
        .then(function (response) {
          handleClickVariant('success');
          localStorage.setItem('UserID', `${response.data.data}`);
          init(`${response.data.data}-${DisplayDataInfo.Displayname}`);
          history.push(`/${type}?topic=${devConfig.topic}${window.location.search}`);
        })
        .catch(function (error) {
          console.log(error);
          setemailValidate(true);
          setnameValidation(true);
          setStartSession(false);
        });
    } else {
      setnameValidation(true);
    }
  };

  return (
    <>
      <Header />
      <Box className="d-flex justify-content-center  align-items-center h-75">
        <Grid
          container
          item
          className="border rounded pt-5"
          // xs={12}
          sm={12}
          md={8}
        >
          <Grid item={true} xs={12} sm={6} md={6} className="flex flex-col justify-content-center  align-items-center ">
            <img src={HeaderIcon} alt="header_logo" className="Joinpagelogo" />
            <Typography
              style={{
                fontSize: '2.54rem',
                fontWeight: 'inherit',
                lineHeight: '43.3px',
                color: '#434343'
              }}
              className="pb-3"
            >
              Playground
            </Typography>
          </Grid>

          <Grid
            item={true}
            xs={12}
            sm={6}
            md={6}
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ transform: 'rotateY(0deg)', transition: '.1s all' }}
          >
            <form onSubmit={(e) => onSubmitForm(e, 'video')}>
              <Box className="d-flex flex-column">
                <TextField
                  error={nameValidation ? true : false}
                  id="filled-search"
                  label="Name to display"
                  type="string"
                  value={DisplayDataInfo.Displayname}
                  style={{ paddingBottom: '20px' }}
                  className="w-100"
                  variant="outlined"
                  autoComplete="off"
                  size="small"
                  name="Displayname"
                  onChange={DisplayNameData}
                />
                <TextField
                  error={emailValidate ? true : false}
                  size="small"
                  style={{ paddingBottom: '20px' }}
                  type="email"
                  className="w-100"
                  variant="outlined"
                  autoComplete="off"
                  label="Email"
                  name="emailinfo"
                  value={DisplayDataInfo.emailinfo}
                  onChange={DisplayNameData}
                  disabled={false}
                />
                <Box className="d-flex align-items-center pb-3">
                  <Checkbox
                    style={{
                      color: '#494CE2'
                    }}
                    checked={SaveTranscript}
                    onClick={() => setSaveTranscript(!SaveTranscript)}
                  />
                  <Typography className="text-secondary">
                    Save my transcript for{' '}
                    <a style={{ textDecoration: 'underline' }} href="https://insights.talkplayground.com/about">
                      Insights
                    </a>
                  </Typography>
                </Box>
              </Box>

              <Button
                // disabled={StartSession}
                type="submit"
                id="demo-positioned-button"
                size="small"
                variant="contained"
                className="w-25"
                style={{ backgroundColor: '#494CE2', color: 'white' }}
              >
                Join
              </Button>
            </form>
          </Grid>

          <Grid item={true} xs={12}>
            <Box className="d-flex justify-content-end align-items-center pb-2 pt-4 pr-4 ">
              <Box className=" hover:text-[#494CE2] d-flex align-items-center">
                <SettingsIcon fontSize="small" />
                <Typography variant="caption" className="pl-1">
                  Settings
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={!UrlShowJoin} autoHideDuration={2000} sx={{ zIndex: 1401 }}>
        <Tooltip title="Copy URL">
          <IconButton onClick={() => setUrlShowJoin(true)} style={{ backgroundColor: 'rgb(73, 76, 226)' }}>
            <LinkIcon style={{ fill: '#fff' }} />
          </IconButton>
        </Tooltip>
      </Snackbar>

      <Snackbar
        open={UrlShowJoin}
        autoHideDuration={2000}
        TransitionComponent={(props) => <Slide {...props} direction="right" />}
      >
        <Alert
          icon={false}
          sx={{
            width: '100%',
            backgroundColor: 'white',
            boxShadow: 3
          }}
          action={
            <>
              <IconButton color="inherit" size="small" onClick={() => navigator.clipboard.writeText(url)}>
                <ContentCopyIcon style={{ fill: '#919499', fontSize: '22' }} className="cursor-pointer" />
              </IconButton>

              <IconButton color="inherit" size="small" onClick={() => setUrlShowJoin(false)}>
                <CloseIcon style={{ fill: '#919499', fontSize: '22' }} className="cursor-pointer" />
              </IconButton>
            </>
          }
        >
          <p style={{ color: 'grey' }}>{url?.length > 35 ? url.slice(0, 35) + '...' : url}</p>
        </Alert>
      </Snackbar>
    </>
  );
};

export default Joinpage;
