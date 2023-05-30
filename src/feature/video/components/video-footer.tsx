import React, { useState, useCallback, useContext, useEffect, MutableRefObject } from 'react';
import classNames from 'classnames';
import { message } from 'antd';
import ZoomContext from '../../../context/zoom-context';
import RecordingContext from '../../../context/recording-context';
import CameraButton from './camera';
import MicrophoneButton from './microphone';
import { ScreenShareButton } from './screen-share';
import AudioVideoStatisticModal from './audio-video-statistic';
import ZoomMediaContext from '../../../context/media-context';
import LiveTranscriptionContext from '../../../context/live-transcription';
import { useUnmount, useMount } from '../../../hooks';
import { MediaDevice } from '../video-types';
import './video-footer.scss';
import {
  getExploreName,
  getWindowOS,
  get_browser,
  isAndroidBrowser,
  isAndroidOrIOSBrowser,
  isSupportOffscreenCanvas,
  isSupportWebCodecs
} from '../../../utils/platform';
import { getPhoneCallStatusDescription, SELF_VIDEO_ID } from '../video-constants';
import { getRecordingButtons, RecordButtonProps, RecordingButton } from './recording';
import {
  DialoutState,
  RecordingStatus,
  MutedSource,
  AudioChangeAction,
  DialOutOption,
  VideoCapturingState,
  SharePrivilege,
  MobileVideoFacingMode
} from '@zoom/videosdk';
import { LiveTranscriptionButton } from './live-transcription';
import { TranscriptionSubtitle } from './transcription-subtitle';
import { IconButton, Badge, styled, Popper, Grow, Paper, ClickAwayListener, MenuList, Theme } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import nosleep from 'nosleep.js';
import useStayAwake from 'use-stay-awake';
import { Box, Grid, Menu, MenuItem, Tooltip, Typography } from '@material-ui/core';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import ClosedCaptionOffOutlinedIcon from '@mui/icons-material/ClosedCaptionOffOutlined';
import mobile from 'is-mobile';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import CallEndIcon from '@mui/icons-material/CallEnd';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { AudioVideoSetting } from './AudioVideoSetting';
import moment from 'moment';
import { topicInfo } from '../../../config/dev';
// var Airtable = require('airtable');
import Airtable from 'airtable';
import axios from 'axios';

interface VideoFooterProps {
  className?: string;
  shareRef?: MutableRefObject<HTMLCanvasElement | null>;
  sharing?: boolean;
  setmodalOpenClose: any;
  modalOpenClose: any;
  setLinkShowCard: any;
  LinkShowCard: any;
  chatRecords?: any;
  StartStopRecording: any;
  RecordingStatus: boolean;
  handleselfView: any;
  NewMsg?: boolean;
  videoRef?: any;
  setIsLoading?: any;
  setLoadingText?: any;
  SaveTranscript?: any;
  setIncallMemberCard?: any;
  settoggleViewScreenPort?: any;
  toggleViewScreenPort?: any;
  inSharing?: boolean;
}

const isAudioEnable = typeof AudioWorklet === 'function';
const VideoFooter = (props: any) => {
  const {
    className,
    shareRef,
    sharing,
    setmodalOpenClose,
    modalOpenClose,
    setLinkShowCard,
    LinkShowCard,
    StartStopRecording,
    RecordingStatus,
    handleselfView,
    chatRecords,
    NewMsg,
    videoRef,
    setIsLoading,
    setLoadingText,
    SaveTranscript,
    setIncallMemberCard,
    settoggleViewScreenPort,
    toggleViewScreenPort,
    inSharing
  } = props;

  var base = new Airtable({
    apiKey: 'patKPLJNYZkVObstV.b30794e0717fa5f41f631cfaff71aed6ba09f62499c2c540d89ffa1d1839d213'
  }).base('appNnssyjFDqcoSKd');

  const [isStartedAudio, setIsStartedAudio] = useState(false);
  const [isStartedVideo, setIsStartedVideo] = useState(false);
  const [audio, setAudio] = useState('');
  const [isSupportPhone, setIsSupportPhone] = useState(false);
  const [phoneCountryList, setPhoneCountryList] = useState<any[]>([]);
  const [phoneCallStatus, setPhoneCallStatus] = useState<DialoutState>();
  const [isStartedScreenShare, setIsStartedScreenShare] = useState(false);
  const [isStartedLiveTranscription, setIsStartedLiveTranscription] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isBlur, setIsBlur] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeMicrophone, setActiveMicrophone] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState('');
  const [activeCamera, setActiveCamera] = useState('');
  const [micList, setMicList] = useState<MediaDevice[]>([]);
  const [speakerList, setSpeakerList] = useState<MediaDevice[]>([]);
  const [cameraList, setCameraList] = useState<MediaDevice[]>([]);
  const [statisticVisible, setStatisticVisible] = useState(false);
  const [selecetedStatisticTab, setSelectedStatisticTab] = useState('audio');
  const [isComputerAudioDisabled, setIsComputerAudioDisabled] = useState(false);
  const [sharePrivilege, setSharePrivileg] = useState(SharePrivilege.Unlocked);
  const [caption, setCaption] = useState({ text: '', isOver: false });

  const { mediaStream } = useContext(ZoomMediaContext);
  const liveTranscriptionClient = useContext(LiveTranscriptionContext);
  const recordingClient = useContext(RecordingContext);
  const [recordingStatus, setRecordingStatus] = useState<'' | RecordingStatus>(
    recordingClient?.getCloudRecordingStatus() || ''
  );
  const zmClient = useContext(ZoomContext);

  const history = useHistory();

  const useStyles = makeStyles((theme: Theme) => ({
    menu: {
      '& .MuiPaper-root': {
        top: 'auto !important',
        bottom: '25px',
        backgroundColor: '#202123'
      }
    }
  }));

  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const participants = zmClient.getAllUser();
  

  var noSleep = new nosleep();
  const device = useStayAwake();

  window.onbeforeunload = function () {
    if (participants?.length == 1 && RecordingStatus) {
      // StartStopRecording(false).then(async () => {
      zmClient.leave();
      // noSleep.disable();
      device.allowSleeping();
      localStorage.removeItem('UserID');
      history.push('/');
      window.location.reload();
      // });
    }
  };

  var isMobile = mobile();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [HideSelfView, setHideSelfView] = useState(false);

  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [onAudioVideoOption, setonAudioVideoOption] = useState(false);

  const onCameraClick = useCallback(async () => {
    try {
      if (isStartedVideo) {
        await mediaStream?.stopVideo();
        setIsStartedVideo(false);
      } else {
        if (isAndroidBrowser() || (isSupportOffscreenCanvas() && !mediaStream?.isSupportMultipleVideos())) {
          const videoElement = document.querySelector(`#${SELF_VIDEO_ID}`) as HTMLVideoElement;
          if (videoElement) {
            await mediaStream?.startVideo({ videoElement });
            await mediaStream?.mirrorVideo(true);
            setIsMirrored(true);
            if (!isSupportWebCodecs() && !isAndroidBrowser() ) {
              const canvasElement = document.querySelector(`#${SELF_VIDEO_ID}`) as HTMLCanvasElement;
              mediaStream?.renderVideo(canvasElement, zmClient.getSessionInfo().userId, 254, 143, 0, 0, 3);
            }
          }
        } else {
          const startVideoOptions = { hd: true };
          if (mediaStream?.isSupportVirtualBackground() && isBlur) {
            Object.assign(startVideoOptions, { virtualBackground: { imageUrl: 'blur' } });
          }
          await mediaStream?.startVideo(startVideoOptions);
          await mediaStream?.mirrorVideo(true);
          setIsMirrored(true);
          if (!mediaStream?.isSupportMultipleVideos()) {
            const canvasElement = document.querySelector(`#${SELF_VIDEO_ID}`) as HTMLCanvasElement;
            mediaStream?.renderVideo(canvasElement, zmClient.getSessionInfo().userId, 254, 143, 0, 0, 3);
          }
          setIsStartedVideo(true);
        }
      }
    } catch (error: any) {
      // if (error?.message) {
        await axios.post('/api/v1/user/airtableCL/errorLog', {
          browserDetails: `${getExploreName()}`,
          browserVersion: `${get_browser()?.version}`,
          computerOS: `${getWindowOS()}`,
          consoleErrorMessage: JSON.stringify(error),
          sectionBug: 'Camera',
          sessionId: `${zmClient.getSessionInfo().sessionId}`,
          timeStamp: `${moment().format('LT') + ' ' + moment().format('ddd, MMM DD')}`,
          userId: `${zmClient.getSessionInfo().userId}`
        });
      // }
    }
  }, [mediaStream, isStartedVideo, zmClient, isBlur]);
  const onMicrophoneClick = useCallback(async () => {
    try {
      if (isStartedAudio) {
        if (isMuted) {
          await mediaStream?.unmuteAudio();
          setIsMuted(false);
        } else {
          await mediaStream?.muteAudio();
          setIsMuted(true);
        }
      } else {
        // await mediaStream?.startAudio({ speakerOnly: true });
        await mediaStream?.startAudio();
        setIsStartedAudio(true);
      }
    } catch (error: any) {
      // if (error?.message) {
        await axios.post('/api/v1/user/airtableCL/errorLog', {
          browserDetails: `${getExploreName()}`,
          browserVersion: `${get_browser()?.version}`,
          computerOS: `${getWindowOS()}`,
          consoleErrorMessage: JSON.stringify(error),
          sectionBug: 'Microphone',
          sessionId: `${zmClient.getSessionInfo().sessionId}`,
          timeStamp: `${moment().format('LT') + ' ' + moment().format('ddd, MMM DD')}`,
          userId: `${zmClient.getSessionInfo().userId}`
        });
      // }
    }
  }, [mediaStream, isStartedAudio, isMuted]);
  const onMicrophoneMenuClick = async (key: string) => {
    if (mediaStream) {
      const [type, deviceId] = key.split('|');
      if (type === 'microphone') {
        if (deviceId !== activeMicrophone) {
          await mediaStream.switchMicrophone(deviceId);
          setActiveMicrophone(mediaStream.getActiveMicrophone());
        }
      } else if (type === 'speaker') {
        if (deviceId !== activeSpeaker) {
          await mediaStream.switchSpeaker(deviceId);
          setActiveSpeaker(mediaStream.getActiveSpeaker());
        }
      } else if (type === 'leave audio') {
        if (audio === 'computer') {
          await mediaStream.stopAudio();
        } else if (audio === 'phone') {
          await mediaStream.hangup();
          setPhoneCallStatus(undefined);
        }
        setIsStartedAudio(false);
      } else if (type === 'statistic') {
        setSelectedStatisticTab('audio');
        setStatisticVisible(true);
      }
    }
  };

  useEffect(() => {
    // onCameraClick()
    onMicrophoneClick();
  }, []);

  
  const onSwitchCamera = async (key: string) => {
    if (mediaStream) {
      if (activeCamera !== key) {
        await mediaStream.switchCamera(key);
        setActiveCamera(mediaStream.getActiveCamera());
      }
    }
  };
  const onMirrorVideo = async () => {
    await mediaStream?.mirrorVideo(!isMirrored);
    setIsMirrored(!isMirrored);
  };
  const onBlurBackground = async () => {
    const vbStatus = mediaStream?.getVirtualbackgroundStatus();
    if (vbStatus?.isVBPreloadReady) {
      if (vbStatus?.isVBConfigured) {
        if (!isBlur) {
          await mediaStream?.updateVirtualBackgroundImage('blur');
        } else {
          await mediaStream?.updateVirtualBackgroundImage(undefined);
        }
      } else {
        if (!isBlur) {
          await mediaStream?.stopVideo();
          await mediaStream?.startVideo({ hd: true, virtualBackground: { imageUrl: 'blur' } });
        }
      }

      setIsBlur(!isBlur);
    }
  };
  const onPhoneCall = async (code: string, phoneNumber: string, name: string, option: DialOutOption) => {
    await mediaStream?.inviteByPhone(code, phoneNumber, name, option);
  };
  const onPhoneCallCancel = async (code: string, phoneNumber: string, option: { callMe: boolean }) => {
    if ([DialoutState.Calling, DialoutState.Ringing, DialoutState.Accepted].includes(phoneCallStatus as any)) {
      await mediaStream?.cancelInviteByPhone(code, phoneNumber, option);
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 3000);
      });
    }
    return Promise.resolve();
  };
  const onHostAudioMuted = useCallback((payload: any) => {
    const { action, source, type } = payload;
    if (action === AudioChangeAction.Join) {
      setIsStartedAudio(true);
      setAudio(type);
    } else if (action === AudioChangeAction.Leave) {
      setIsStartedAudio(false);
    } else if (action === AudioChangeAction.Muted) {
      setIsMuted(true);
      if (source === MutedSource.PassiveByMuteOne) {
        message.info('Host muted you');
      }
    } else if (action === AudioChangeAction.Unmuted) {
      setIsMuted(false);
      if (source === 'passive') {
        message.info('Host unmuted you');
      }
    }
  }, []);
  const onScreenShareClick = useCallback(async () => {
    try {
      if (!isStartedScreenShare && shareRef && shareRef.current) {
        await mediaStream?.startShareScreen(shareRef.current, { requestReadReceipt: true });
        setIsStartedScreenShare(true);
      } else if (isStartedScreenShare) {
        await mediaStream?.stopShareScreen();
        setIsStartedScreenShare(false);
      }
    } catch (error: any) {
      // if (error?.message) {
        await axios.post('/api/v1/user/airtableCL/errorLog', {
          browserDetails: `${getExploreName()}`,
          browserVersion: `${get_browser()?.version}`,
          computerOS: `${getWindowOS()}`,
          consoleErrorMessage: JSON.stringify(error),
          sectionBug: 'ScreenShare',
          sessionId: `${zmClient.getSessionInfo().sessionId}`,
          timeStamp: `${moment().format('LT') + ' ' + moment().format('ddd, MMM DD')}`,
          userId: `${zmClient.getSessionInfo().userId}`
        });
      // }
    }
  }, [mediaStream, isStartedScreenShare, shareRef]);

  const onLiveTranscriptionClick = useCallback(async () => {
    if (!isStartedLiveTranscription) {
      await liveTranscriptionClient?.startLiveTranscription();
      setIsStartedLiveTranscription(true);
    }
  }, [isStartedLiveTranscription, liveTranscriptionClient]);

  const onPassivelyStopShare = useCallback(({ reason }: any) => {
    console.log('passively stop reason:', reason);
    setIsStartedScreenShare(false);
  }, []);
  const onDeviceChange = useCallback(() => {
    if (mediaStream) {
      setMicList(mediaStream.getMicList());
      setSpeakerList(mediaStream.getSpeakerList());
      if (!isAndroidOrIOSBrowser()) {
        setCameraList(mediaStream.getCameraList());
      }
      setActiveMicrophone(mediaStream.getActiveMicrophone());
      setActiveSpeaker(mediaStream.getActiveSpeaker());
      setActiveCamera(mediaStream.getActiveCamera());
    }
  }, [mediaStream]);

  const onRecordingChange = useCallback(() => {
    setRecordingStatus(recordingClient?.getCloudRecordingStatus() || '');
  }, [recordingClient]);

  const onDialOutChange = useCallback((payload: any) => {
    setPhoneCallStatus(payload.code);
  }, []);

  const onRecordingClick = async (key: string) => {
    switch (key) {
      case 'Record': {
        await recordingClient?.startCloudRecording();
        break;
      }
      case 'Resume': {
        await recordingClient?.resumeCloudRecording();
        break;
      }
      case 'Stop': {
        await recordingClient?.stopCloudRecording();
        break;
      }
      case 'Pause': {
        await recordingClient?.pauseCloudRecording();
        break;
      }
      case 'Status': {
        break;
      }
      default: {
        await recordingClient?.startCloudRecording();
      }
    }
  };
  const onVideoCaptureChange = useCallback((payload: any) => {
    if (payload.state === VideoCapturingState.Started) {
      setIsStartedVideo(true);
    } else {
      setIsStartedVideo(false);
    }
  }, []);
  const onShareAudioChange = useCallback((payload: any) => {
    const { state } = payload;
    if (state === 'on') {
      setIsComputerAudioDisabled(true);
    } else if (state === 'off') {
      setIsComputerAudioDisabled(false);
    }
  }, []);
  const onHostAskToUnmute = useCallback((payload: any) => {
    const { reason } = payload;
    console.log(`Host ask to unmute the audio.`, reason);
  }, []);

  const onCaptionStatusChange = useCallback((payload: any) => {
    const { autoCaption } = payload;
    if (autoCaption) {
      message.info('Auto live transcription enabled!');
    }
  }, []);

  const onCaptionMessage = useCallback((payload: any) => {
    const { text, done } = payload;
    setCaption({
      text,
      isOver: done
    });
  }, []);
  const onCanSeeMyScreen = useCallback(() => {
    message.info('Users can now see your screen', 1000);
  }, []);

  useEffect(() => {
    zmClient.on('current-audio-change', onHostAudioMuted);
    zmClient.on('passively-stop-share', onPassivelyStopShare);
    zmClient.on('device-change', onDeviceChange);
    zmClient.on('recording-change', onRecordingChange);
    zmClient.on('dialout-state-change', onDialOutChange);
    zmClient.on('video-capturing-change', onVideoCaptureChange);
    zmClient.on('share-audio-change', onShareAudioChange);
    zmClient.on('host-ask-unmute-audio', onHostAskToUnmute);
    zmClient.on('caption-status', onCaptionStatusChange);
    zmClient.on('caption-message', onCaptionMessage);
    zmClient.on('share-can-see-screen', onCanSeeMyScreen);
    return () => {
      zmClient.off('current-audio-change', onHostAudioMuted);
      zmClient.off('passively-stop-share', onPassivelyStopShare);
      zmClient.off('device-change', onDeviceChange);
      zmClient.off('recording-change', onRecordingChange);
      zmClient.off('dialout-state-change', onDialOutChange);
      zmClient.off('video-capturing-change', onVideoCaptureChange);
      zmClient.off('share-audio-change', onShareAudioChange);
      zmClient.off('host-ask-unmute-audio', onHostAskToUnmute);
      zmClient.off('caption-status', onCaptionStatusChange);
      zmClient.off('caption-message', onCaptionMessage);
      zmClient.off('share-can-see-screen', onCanSeeMyScreen);
    };
  }, [
    zmClient,
    onHostAudioMuted,
    onPassivelyStopShare,
    onDeviceChange,
    onRecordingChange,
    onDialOutChange,
    onVideoCaptureChange,
    onShareAudioChange,
    onHostAskToUnmute,
    onCaptionStatusChange,
    onCaptionMessage,
    onCanSeeMyScreen
  ]);
  useUnmount(() => {
    if (isStartedAudio) {
      mediaStream?.stopAudio();
    }
    if (isStartedVideo) {
      mediaStream?.stopVideo();
    }
    if (isStartedScreenShare) {
      mediaStream?.stopShareScreen();
    }
  });
  useMount(() => {
    if (mediaStream) {
      setIsSupportPhone(!!mediaStream.isSupportPhoneFeature());
      setPhoneCountryList(mediaStream.getSupportCountryInfo() || []);
      setSharePrivileg(mediaStream.getSharePrivilege());
      if (isAndroidOrIOSBrowser()) {
        setCameraList([
          { deviceId: MobileVideoFacingMode.User, label: 'Front-facing' },
          { deviceId: MobileVideoFacingMode.Environment, label: 'Rear-facing' }
        ]);
      }
    }
  });
  useEffect(() => {
    if (mediaStream && zmClient.getSessionInfo().isInMeeting) {
      mediaStream.subscribeAudioStatisticData();
      mediaStream.subscribeVideoStatisticData();
    }
    return () => {
      if (zmClient.getSessionInfo().isInMeeting) {
        mediaStream?.unsubscribeAudioStatisticData();
        mediaStream?.unsubscribeVideoStatisticData();
      }
    };
  }, [mediaStream, zmClient]);
  const recordingButtons: RecordButtonProps[] = getRecordingButtons(recordingStatus, zmClient.isHost());
  return (
    <>
      <AudioVideoSetting
        onAudioVideoOption={onAudioVideoOption}
        setonAudioVideoOption={setonAudioVideoOption}
        selfShareRef={videoRef}
        zmClient={zmClient}
        mediaStream={mediaStream}
        cameraList={cameraList}
        activeCamera={activeCamera}
        speakerList={speakerList}
        micList={micList}
      />
      <div className={classNames('video-footer px-4', className)}>
        <div className="d-flex footer-left">
          <Box
            className="text-white px-3"
            style={{ fontWeight: 'bold' }}
            sx={{
              display: { xs: 'none', sm: 'block' },
              borderRight: { md: '1px solid white' }
            }}
          >
            {moment().format('LT')}
          </Box>

          {topicInfo ? (
            <Box
              className="text-white px-3 "
              style={{ fontWeight: 'bold' }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {topicInfo}
            </Box>
          ) : (
            <Box
              className="text-white px-3 "
              style={{ fontWeight: 'bold' }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {urlParams.get('topic')}
            </Box>
          )}
        </div>
        <div className="d-flex footer-center justify-content-center">
          {isAudioEnable && (
            <MicrophoneButton
              isStartedAudio={isStartedAudio}
              isMuted={isMuted}
              isSupportPhone={isSupportPhone}
              audio={audio}
              phoneCountryList={phoneCountryList}
              onPhoneCallClick={onPhoneCall}
              onPhoneCallCancel={onPhoneCallCancel}
              phoneCallStatus={getPhoneCallStatusDescription(phoneCallStatus)}
              onMicrophoneClick={onMicrophoneClick}
              onMicrophoneMenuClick={onMicrophoneMenuClick}
              microphoneList={micList}
              speakerList={speakerList}
              activeMicrophone={activeMicrophone}
              activeSpeaker={activeSpeaker}
              disabled={isComputerAudioDisabled}
              HideSelfView={HideSelfView}
            />
          )}
          <CameraButton
            isStartedVideo={isStartedVideo}
            onCameraClick={onCameraClick}
            onSwitchCamera={onSwitchCamera}
            onMirrorVideo={onMirrorVideo}
            onVideoStatistic={() => {
              setSelectedStatisticTab('video');
              setStatisticVisible(true);
            }}
            onBlurBackground={onBlurBackground}
            cameraList={cameraList}
            activeCamera={activeCamera}
            isMirrored={isMirrored}
            isBlur={isBlur}
            HideSelfView={HideSelfView}
          />
          {sharing && !isAndroidOrIOSBrowser() && (
            <ScreenShareButton
              sharePrivilege={sharePrivilege}
              isHostOrManager={zmClient.isHost() || zmClient.isManager()}
              isStartedScreenShare={isStartedScreenShare}
              onScreenShareClick={onScreenShareClick}
              onSharePrivilegeClick={async (privilege) => {
                await mediaStream?.setSharePrivilege(privilege);
                setSharePrivileg(privilege);
              }}
            />
          )}
          <IconButton
            // className={isMuted ? "microphone-button" : "microphone-button"}
            className="ml-3 screen-share-button"
            style={{ backgroundColor: true ? '#3c4043' : '#ea4335' }}
            // onClick={onMicrophoneClick}
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreVertOutlinedIcon style={{ fill: '#fff' }} />
          </IconButton>

          {isAndroidOrIOSBrowser() ? (
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              className={classes.menu}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button'
              }}
              style={{ marginTop: '60%' }}
            >
              {/* <MenuItem
          disabled={isStartedVideo ? false : true}
          onClick={() => {
            handleMirrorView(!MirrorView);
            setAnchorEl(null);
          }}
        >
          {MirrorView ? "Off Mirror View" : "On mirror View"}
        </MenuItem> */}
              <Box sx={{ width: '95vw' }}>
                <Grid container>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          setmodalOpenClose(!modalOpenClose);
                          setLinkShowCard(false);
                          setAnchorEl(null);
                          setIncallMemberCard(false);
                        }}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <CommentOutlinedIcon fontSize="medium" style={{ fill: '#fff' }} />
                        <Typography variant="body1" style={{ color: 'white' }}>
                          Chat
                        </Typography>
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20
                      }}
                    >
                      <IconButton
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <ClosedCaptionOffOutlinedIcon
                          style={{
                            fill: RecordingStatus && SaveTranscript ? 'red' : '#fff'
                          }}
                          fontSize="medium"
                          color="action"
                        />
                        <Typography variant="body1" style={{ color: 'white' }}>
                          Transcript
                        </Typography>
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          setmodalOpenClose(false);
                          setLinkShowCard(!LinkShowCard);
                          setAnchorEl(null);
                          setIncallMemberCard(false);
                        }}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <InfoOutlinedIcon fontSize="medium" style={{ fill: '#fff' }} />
                        <Typography variant="body1" style={{ color: 'white' }}>
                          Link
                        </Typography>
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          setIncallMemberCard((prev: any) => !prev);
                          setmodalOpenClose(false);
                          setLinkShowCard(false);
                          setAnchorEl(null);
                        }}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <PeopleAltIcon fontSize="medium" style={{ fill: '#fff' }} />
                        <Typography variant="body1" style={{ color: 'white' }}>
                          People
                        </Typography>
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20
                      }}
                    >
                      <IconButton
                        disabled={!inSharing}
                        onClick={() => {
                          settoggleViewScreenPort((prev: any) => !prev);
                          setmodalOpenClose(false);
                          setLinkShowCard(false);
                          setAnchorEl(null);
                        }}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <PeopleAltIcon fontSize="medium" style={{ fill: '#fff' }} />
                        <Typography variant="body1" style={{ color: 'white' }}>
                          {toggleViewScreenPort ? 'Hide Member' : 'View Member'}
                        </Typography>
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              {/* <MenuItem
                // disabled={isStartedVideo ? false : true}
                onClick={() => {
                  setonAudioVideoOption(true);
                  setAnchorEl(null);
                }}
              >
                Audio/Video Settings
              </MenuItem>
              {!HideSelfView ? (
                <MenuItem
                  disabled={zmClient.getAllUser()?.length > 1 ? false : true}
                  onClick={() => {
                    handleselfView(!HideSelfView);
                    setHideSelfView(!HideSelfView);
                    setAnchorEl(null);
                  }}
                >
                  Hide Self view
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => {
                    handleselfView(!HideSelfView);
                    setHideSelfView(!HideSelfView);
                    setAnchorEl(null);
                  }}
                >
                  Show Self view
                </MenuItem>
              )} */}
            </Menu>
          ) : (
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button'
              }}
              style={{ marginBottom: '-18px' }}
            >
              {/* <MenuItem
            disabled={isStartedVideo ? false : true}
            onClick={() => {
              handleMirrorView(!MirrorView);
              setAnchorEl(null);
            }}
          >
            {MirrorView ? "Off Mirror View" : "On mirror View"}
          </MenuItem> */}
              <MenuItem
                // disabled={isStartedVideo ? false : true}
                onClick={() => {
                  setonAudioVideoOption(true);
                  setAnchorEl(null);
                }}
              >
                Audio/Video Settings
              </MenuItem>
              {!HideSelfView ? (
                <MenuItem
                  // disabled={zmClient.getAllUser()?.length > 1 ? false : true}
                  onClick={async () => {
                    // if (isStartedVideo) {
                    //   await onCameraClick();
                    // }
                    handleselfView(!HideSelfView);
                    await setHideSelfView(true);
                    setAnchorEl(null);
                  }}
                >
                  Hide Self view
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={async () => {
                    handleselfView(!HideSelfView);
                    await setHideSelfView(false);
                    setAnchorEl(null);
                  }}
                >
                  Show Self view
                </MenuItem>
              )}
            </Menu>
          )}

          {/* </Tooltip> */}
          <Typography
            className="rounded-pill ml-3"
            style={{
              padding: '8px 16px',
              backgroundColor: '#ea4335',
              cursor: 'pointer',
              minHeight: '1rem',
              maxHeight: '3rem',
              height: 'auto'
            }}
            onClick={async () => {
              if (participants?.length == 1) {
                setLoadingText('You left the meeting');
                setIsLoading(true);
                StartStopRecording(false).then(async () => {
                  zmClient.leave();
                  noSleep.disable();
                  device.allowSleeping();
                  localStorage.removeItem('UserID');
                  history.push('/');
                  window.location.reload();
                });
              } else {
                if (SaveTranscript) {
                  enqueueSnackbar('Transcript Stoped', { variant: 'info' });
                }
                setLoadingText('You left the meeting');
                setIsLoading(true);
                zmClient.leave();
                noSleep.disable();
                device.allowSleeping();
                localStorage.removeItem('UserID');
                history.push('/');
                window.location.reload();
              }
            }}
          >
            {/* <Tooltip title={"Call Ended"} style={{ backgroundColor: "black" }}> */}
            <CallEndIcon style={{ fill: '#fff' }} />
            {/* </Tooltip> */}
          </Typography>
          {/* {recordingButtons.map((button: RecordButtonProps) => {
        return (
          <RecordingButton
            key={button.text}
            onClick={() => {
              onRecordingClick(button.text);
            }}
            {...button}
          />
        );
      })}
      {liveTranscriptionClient?.getLiveTranscriptionStatus().isLiveTranscriptionEnabled && (
        <>
          <LiveTranscriptionButton
            isStartedLiveTranscription={isStartedLiveTranscription}
            onLiveTranscriptionClick={onLiveTranscriptionClick}
          />
          <TranscriptionSubtitle text={caption.text} />
        </>
      )} */}
        </div>
        <div className="footer-right d-flex align-items-center">
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' }
            }}
          >
            <Tooltip title="Meeting details">
              <IconButton
                className="ml-2 HoverIcon"
                onClick={() => {
                  setmodalOpenClose(false);
                  setLinkShowCard(!LinkShowCard);
                }}
              >
                <InfoOutlinedIcon style={{ fill: '#fff' }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' }
            }}
          >
            <Tooltip title="Chat with everyone">
              <IconButton
                sx={{ display: { xs: 'none', md: 'block' } }}
                className="ml-2 HoverIcon"
                onClick={() => {
                  setmodalOpenClose(!modalOpenClose);
                  setLinkShowCard(false);
                }}
              >
                <Badge variant={NewMsg ? 'dot' : 'standard'} color="info">
                  <CommentOutlinedIcon style={{ fill: '#fff' }} />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' }
            }}
          >
            <Tooltip title={RecordingStatus && SaveTranscript ? 'Transcript On' : 'Transcript Off'}>
              <IconButton
                sx={{ display: { xs: 'none', md: 'block' } }}
                // onClick={() => {
                //   StartStopRecording(!RecordingStatus);
                // }}
                className="ml-2 HoverIcon"
              >
                <ClosedCaptionOffOutlinedIcon
                  style={{
                    fill: RecordingStatus && SaveTranscript ? 'red' : '#fff'
                  }}
                  color="action"
                />
              </IconButton>
            </Tooltip>
          </Box>
        </div>
        <AudioVideoStatisticModal
          visible={statisticVisible}
          setVisible={setStatisticVisible}
          defaultTab={selecetedStatisticTab}
          isStartedAudio={isStartedAudio}
          isMuted={isMuted}
          isStartedVideo={isStartedVideo}
        />
      </div>
    </>
  );
};
export default VideoFooter;
