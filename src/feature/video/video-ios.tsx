import { Box, Divider, IconButton, Slide, Typography } from '@mui/material';
import Avatar from './components/avatar';
import React, { useContext, useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import BasicCard from '../../component/pages/Linkcard';
import zoomContext from '../../context/zoom-context';
import {
  isAndroidBrowser,
  isAndroidOrIOSBrowser,
  isSupportOffscreenCanvas,
  isSupportWebCodecs
} from '../../utils/platform';
import ChatContainer from '../chat/chat';
import VideoFooter from './components/video-footer';
import { useShare } from './hooks/useShare';
import _ from 'lodash';

import ZoomMediaContext from '../../context/media-context';
import { Participant } from '../../index-types';
import classnames from 'classnames';
import { useLocalVolume } from './hooks/useLocalVolume';
import { useParticipantsChange } from './hooks/useParticipantsChange';
import { useMount, useSizeCallback } from '../../hooks';
import { SELF_VIDEO_ID } from './video-constants';
import { ChatRecord } from '../chat/chat-types';
import { getQueryString } from '../../Api';
import axios from 'axios';
import moment from 'moment';

import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import usePictureInPicture from 'react-use-pip';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import { MobileVideoFacingMode } from '@zoom/videosdk';
import { url } from '../../App';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';
import useStayAwake from 'use-stay-awake';
import { isShallowEqual } from '../../utils/util';
import nosleep from 'nosleep.js';
import ScreenLockPortraitIcon from '@mui/icons-material/ScreenLockPortrait';


const isUseVideoElementToDrawSelfVideo = isAndroidBrowser() || (isSupportOffscreenCanvas() && isSupportWebCodecs());

interface VideoProps extends RouteComponentProps {
  DisplayDataInfo?: any;
  setIsLoading?: Function;
  setLoadingText?: Function;
  SaveTranscript: any;
}

const VideoContainer: React.FunctionComponent<VideoProps> = (props) => {
  const { DisplayDataInfo, setIsLoading, setLoadingText, SaveTranscript } = props;
  const zmClient = useContext(zoomContext);
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const RecordingZoomApi: any = zmClient?.getRecordingClient();
  const { enqueueSnackbar } = useSnackbar();
  var UserId = localStorage.getItem('UserID');
  var noSleep = new nosleep();
  const info = {
    ...zmClient.getSessionInfo()
  };
  const device = useStayAwake();

  const { userVolumeList, setLocalVolume } = useLocalVolume();
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const [shareViewDimension, setShareViewDimension] = useState({
    width: 0,
    height: 0
  });
  const PIPRef = useRef(null);
  const { isPictureInPictureActive, isPictureInPictureAvailable, togglePictureInPicture } = usePictureInPicture(PIPRef);
  useParticipantsChange(zmClient, (payload) => {
    setParticipants(payload);
  });
  const [activeVideo, setActiveVideo] = useState<number>(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const isCurrentUserStartedVideo = zmClient.getCurrentUserInfo()?.bVideoOn;
  // &&  participants.length === 1;

  const [modalOpenClose, setmodalOpenClose] = useState(false);
  const [LinkShowCard, setLinkShowCard] = useState(false);
  const [chatRecords, setChatRecords] = useState<ChatRecord[]>([]);
  const [RecordingStatus, setRecordingStatus] = useState(false);
  const [IncallMemberCard, setIncallMemberCard] = useState(false);
  const [containerDimension, setContainerDimension] = useState({
    width: 0,
    height: 0
  });
  const [toggleViewScreenPort, settoggleViewScreenPort] = useState(false);


  const onActiveVideoChange = useCallback((payload: any) => {
    const { userId } = payload;
    setActiveVideo(userId);
  }, []);

  useEffect(() => {
    zmClient.on('video-active-change', onActiveVideoChange);
    return () => {
      zmClient.off('video-active-change', onActiveVideoChange);
    };
  }, [zmClient, onActiveVideoChange]);

  useMount(() => {
    if (mediaStream) {
      setActiveVideo(mediaStream.getActiveVideoId());
    }
  });

  const JoinSessionApi = async () => {
    const info = {
      ...zmClient.getSessionInfo()
    };
    var a = false;
    if (UserId) {
      await axios
        .post('/api/v1/user/session/store', {
          userId: UserId,
          sessionId: info.sessionId
        })
        .then(function (response) {
          a = true;
        })
        .catch(function (error) {
          console.log(error);
        });
    }
    if (a) {
      return a;
    }
  };

  useEffect(() => {
    const participants = zmClient.getAllUser();
    console.log(zmClient.getSessionInfo().userId, participants);
    noSleep.enable();
    device.preventSleeping();

    const info = {
      ...zmClient.getSessionInfo()
    };

    const startAPi = async () => {
      const data: any = await JoinSessionApi();
      if (data && participants?.length == 1) {
        StartStopRecording(!RecordingStatus);
      } else if (data) {
        if (RecordingZoomApi?.getCloudRecordingStatus() == 'Recording') {
          setRecordingStatus(true);
          if (SaveTranscript) {
            enqueueSnackbar('Transcript Started', {
              variant: 'info',
              anchorOrigin: { horizontal: 'left', vertical: isAndroidOrIOSBrowser() ? 'top' : 'bottom' }
            });
          } else {
            await axios.post('/api/v1/user/transcripts/delete/statusChange', {
              userId: UserId,
              status: false,
              sessionId: info.sessionId
            });
          }
          ///Call Api Here with else
        } else {
          StartStopRecording(true);
        }
      }
    };
    startAPi();
  }, []);

  const StartStopRecording = async (data: boolean) => {
    if (data) {
      await RecordingZoomApi.startCloudRecording()
        .then(async function (response: any) {
          setRecordingStatus(data);
          if (SaveTranscript) {
            enqueueSnackbar('Transcript Started', {
              variant: 'info',
              anchorOrigin: { horizontal: 'left', vertical: isAndroidOrIOSBrowser() ? 'top' : 'bottom' }
            });
          } else {
            await axios.post('/api/v1/user/transcripts/delete/statusChange', {
              userId: UserId,
              status: false,
              sessionId: info.sessionId
            });
          }
          ///Call Api Here with else
          await axios.post(
            '/api/v1/user/session/frontend/loggers' +
              '?' +
              getQueryString({
                logs: `Recording Started on ${moment().format('DD/MM/YYYY LT')}`
              })
          );
        })
        .catch(async function (error: any) {
          console.log(error);
          await axios.post(
            '/api/v1/user/session/frontend/loggers' +
              '?' +
              getQueryString({
                logs: error?.message + ' ' + moment().format('DD/MM/YYYY LT')
              })
          );
        });
    } else {
      await RecordingZoomApi.stopCloudRecording()
        .then(async function (response: any) {
          setRecordingStatus(data);
          if (SaveTranscript) {
            enqueueSnackbar('Transcript Stoped', {
              variant: 'info',
              anchorOrigin: { horizontal: 'left', vertical: isAndroidOrIOSBrowser() ? 'top' : 'bottom' }
            });
          }
          await axios.post(
            '/api/v1/user/session/frontend/loggers' +
              '?' +
              getQueryString({
                logs: `Recording Stoped on ${moment().format('DD/MM/YYYY LT')}`
              })
          );
        })
        .catch(async function (error: any) {
          console.log(error);
          await axios.post(
            '/api/v1/user/session/frontend/loggers' +
              '?' +
              getQueryString({
                logs: error?.message + ' ' + moment().format('DD/MM/YYYY LT')
              })
          );
        });
    }
  };

  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  const shareRef = useRef<HTMLCanvasElement | null>(null);
  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(zmClient, mediaStream, shareRef);
  const isSharing = isRecieveSharing || isStartedShare;
  const selfShareRef = useRef<HTMLCanvasElement & HTMLVideoElement>(null);
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  const activeUser = useMemo(
    () => participants.find((user) => user.userId === activeVideo && user.userId !== zmClient.getSessionInfo().userId),
    [participants, activeVideo]
  );

  const RenderVideo = async (activeUser: any) => {
    // console.log('first=====>');
    await mediaStream?.renderVideo(videoRef.current as HTMLCanvasElement, activeUser.userId, 254, 143, 0, 0, 3);
  };

  useEffect(() => {
    if (activeUser?.bVideoOn) {
      RenderVideo(activeUser);
    }
  }, [activeUser, activeUser?.bVideoOn]);
  

  // useEffect(() => {
  //   console.log("bvideoOn")
  //   if (zmClient.getCurrentUserInfo().bVideoOn) {
  //     const canvasElement = document.querySelector(`#${SELF_VIDEO_ID}`) as HTMLCanvasElement;
  //             mediaStream?.renderVideo(canvasElement, zmClient.getSessionInfo().userId, 254, 143, 0, 0, 3);
  //   }else{
  //     mediaStream?.stopVideo();
  //   }
  // }, [zmClient.getCurrentUserInfo().bVideoOn]);

  const handleselfView = async (data: any) => {
    // if (data) {
    //   setShowAlert(true);
    //   setselfViewGalleryLayout(true);
    //   var index = visibleParticipants.findIndex((e: any) => e.userId === info.userId);
    //   AllvisibleParticipants.push(visibleParticipants[index]);
    //   setRenderShowHide(true);
    //   visibleParticipants.splice(index, 1);
    // } else {
    //   setselfViewGalleryLayout(false);
    //   visibleParticipants.push(AllvisibleParticipants[0]);
    //   setRenderShowHide(false);
    //   setAllvisibleParticipants([]);
    // }
  };

  useEffect(() => {
    if (isSharing && shareContainerRef.current) {
      const { width, height } = sharedContentDimension;
      const { width: containerWidth, height: containerHeight } = containerDimension;
      const ratio = Math.min(containerWidth / width, containerHeight / height, 1);
      setShareViewDimension({
        width: Math.floor(width * ratio),
        height: Math.floor(height * ratio)
      });
    }
  }, [isSharing, sharedContentDimension, containerDimension]);

  const onShareContainerResize = useCallback(({ width, height }: any) => {
    _.throttle(() => {
      setContainerDimension({ width, height });
    }, 50)();
  }, []);
  useSizeCallback(shareContainerRef.current, onShareContainerResize);
  useEffect(() => {
    if (!isShallowEqual(shareViewDimension, sharedContentDimension)) {
      mediaStream?.updateSharingCanvasDimension(shareViewDimension.width, shareViewDimension.height);
    }
  }, [mediaStream, sharedContentDimension, shareViewDimension]);

  const ToggleCamera = async () => {
    if (mediaStream) {
      await mediaStream.switchCamera(
        mediaStream.getActiveCamera() === MobileVideoFacingMode.User
          ? MobileVideoFacingMode.Environment
          : MobileVideoFacingMode.User
      );
    }
  };

  document.addEventListener("mousemove", () => noSleep.enable());
  document.querySelector("#Screenlock")?.addEventListener("click", () =>{console.log("clickeeedddd"); noSleep.enable();});

  const PIPMode = () => {
    togglePictureInPicture(!isPictureInPictureActive);
  };

  console.log('activeUser', participants, activeUser);

  return (
    <div className="viewport">
      <div
        className={classnames('share-container', {
          'in-sharing': isSharing
        })}
        ref={shareContainerRef}
      >
        <div
          className="share-container-viewport"
          style={{
            width: `${shareViewDimension.width}px`,
            height: `${shareViewDimension.height}px`
          }}
        >
          <canvas className={classnames('share-canvas ccg', { hidden: isStartedShare })} ref={shareRef} />
          {isSupportWebCodecs() ? (
            <video className={classnames('share-canvas', { hidden: isRecieveSharing })} ref={selfShareRef} />
          ) : (
            <canvas className={classnames('share-canvas', { hidden: isRecieveSharing })} ref={selfShareRef} />
          )}
        </div>
      </div>
      {isAndroidOrIOSBrowser() && (
        <div className="d-flex align-items-center px-3 position-absolute" style={{ width: '100vw', top: 0 }}>
          <div style={{ flex: 1 }} className="d-flex">
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>{urlParams.get('topic')}</p>
          </div>
          <IconButton 
          id="Screenlock">
            <ScreenLockPortraitIcon style={{ fill: '#fff' }} />
          </IconButton>
          <IconButton onClick={PIPMode}>
            <PictureInPictureAltIcon style={{ fill: '#fff' }} />
          </IconButton>
          <IconButton onClick={ToggleCamera}>
            <FlipCameraIosIcon style={{ fill: '#fff' }} />
          </IconButton>
        </div>
      )}
      {/* {isAndroidOrIOSBrowser() && (
        <div
          className="MyVideo"
          style={{
            position: 'absolute',
            right: '15px',
            bottom: '100px',
            width: '30vw',
            height: '20vh',
            zIndex: 10
          }}
        >
          {isUseVideoElementToDrawSelfVideo ? (
            <video
              id="myVideoTag"
              style={{
                borderRadius: '10px',
                visibility: participants.length == 1 ? 'hidden' : !IsCameraActive ? 'hidden' : 'inherit'
              }}
              width="118"
              height="165"
              // className={classnames('self-video', {
              //   'single-self-video': participants.length > 1,
              //   'self-video-show': isCurrentUserStartedVideo
              // })}
            />
          ) : (
            <canvas
              id={SELF_VIDEO_ID}
              width="254"
              height="143"
              className={classnames('self-video', {
                'single-self-video': participants.length === 1,
                'self-video-show': isCurrentUserStartedVideo
              })}
            />
          )}
        </div>
      )} */}
      <div
        className={classnames('video-container', {
          'in-sharing': isSharing
        })}
        style={{
          width: isSharing && isAndroidOrIOSBrowser() ? (toggleViewScreenPort ? '264px' : '0px') : '100%',
          position: isSharing && isAndroidOrIOSBrowser() ? (toggleViewScreenPort ? 'inherit' : 'fixed') : 'inherit'
        }}
      >
        {/* <div style={{position:"absolute",top:`${window.innerWidth/2}px`}}> */}

        <canvas className="video-canvas video-canvas-mobile" style={{top:`${window.innerWidth/2}px`}} id="video-canvas" width="800" height="600" ref={videoRef} />
        {/* </div> */}
        {isUseVideoElementToDrawSelfVideo ? (
          <video
            // ref={PIPRef}
            id={SELF_VIDEO_ID}
            className={classnames(
              `self-video ${isAndroidOrIOSBrowser() && participants.length > 1 && 'isMobileView'}`,
              {
                'single-self-video': participants.length === 1,
                'self-video-show': isCurrentUserStartedVideo
              }
            )}
          />
        ) : (
          <canvas
            // ref={PIPRef}
            id={SELF_VIDEO_ID}
            width="254"
            height="143"
            className={classnames(
              `self-video ${isAndroidOrIOSBrowser() && participants.length > 1 && 'isMobileView'}`,
              {
                'single-self-video': participants.length === 1,
                'self-video-show': isCurrentUserStartedVideo
              }
            )}
          />
        )}
        {activeUser && participants.length > 1 ? (
          <Avatar
            participant={activeUser}
            isActive={false}
            className="single-view-avatar"
            volume={userVolumeList.find((u) => u.userId === activeUser.userId)?.volume}
            setLocalVolume={setLocalVolume}
          />
        ) : (
          participants.length == 1 && (
            <Avatar
              participant={participants[0]}
              isActive={false}
              className="single-view-avatar"
              volume={userVolumeList.find((u) => u.userId === participants[0].userId)?.volume}
              setLocalVolume={setLocalVolume}
            />
          )
        )}
      </div>

      {/* <Box style={{ position: 'absolute' }}>
        <DemoTabs />
       
       
      </Box> */}
      {isAndroidOrIOSBrowser() ? (
        <Slide
          direction={'left'}
          in={LinkShowCard}
          mountOnEnter
          unmountOnExit
          style={{
            position: 'absolute',
            backgroundColor: '#202123',
            height: '90vh',
            zIndex: '10',
            width: ' 100vw',
            color: '#fff',
            borderTopLeftRadius: '30px',
            borderTopRightRadius: '30px'
          }}
        >
          <Box>
            <Box className="d-flex justify-content-between align-items-center pt-3 px-4">
              <Typography variant="h6" color="inherit" style={{ color: '#fff' }}>
                Info
              </Typography>
              <IconButton className="" onClick={() => setLinkShowCard(false)}>
                <CloseIcon className="cursor-pointer" style={{ fill: '#fff' }} />
              </IconButton>
            </Box>
            <Box className="px-3">
              <Divider className="py-2" style={{ borderColor: 'white' }} />
            </Box>
            <Box className="d-flex justify-content-between align-items-center px-4 py-2">
              <Typography>Joining Info</Typography>
              <IconButton onClick={() => navigator.clipboard.writeText(url)}>
                <ContentCopyIcon className="cursor-pointer" style={{ fill: '#fff' }} />
              </IconButton>
            </Box>
            <Typography className="mx-4 p-2" style={{ backgroundColor: 'rgb(73, 76, 226)', borderRadius: '10px' }}>
              {url}
            </Typography>
          </Box>
        </Slide>
      ) : (
        LinkShowCard && (
          <BasicCard setLinkShowCard={setLinkShowCard} LinkShowCard={LinkShowCard} DisplayDataInfo={DisplayDataInfo} />
        )
      )}

      {isAndroidOrIOSBrowser() && (
        <Slide
          direction={'left'}
          in={IncallMemberCard}
          mountOnEnter
          unmountOnExit
          style={{
            position: 'absolute',
            backgroundColor: '#202123',
            height: '90vh',
            zIndex: '10',
            width: ' 100vw',
            color: '#fff',
            borderTopLeftRadius: '30px',
            borderTopRightRadius: '30px'
          }}
        >
          <Box>
            <Box className="d-flex justify-content-between align-items-center pt-3 px-4">
              <Typography variant="h6" color="inherit" style={{ color: '#fff' }}>
                In Call Member
              </Typography>
              <IconButton className="" onClick={() => setIncallMemberCard(false)}>
                <CloseIcon className="cursor-pointer" style={{ fill: '#fff' }} />
              </IconButton>
            </Box>
            <Box className="px-3">
              <Divider className="py-2" style={{ borderColor: 'white' }} />
            </Box>
            <Box className="">
              {zmClient.getAllUser().map((e: any) => (
                <Box className="d-flex align-items-center pt-3 px-4">
                  <img src={e.avatar} style={{ width: '40px', borderRadius: '54px' }} />
                  <Typography
                    variant="inherit"
                    color="inherit"
                    style={{ color: '#fff', fontSize: '18px', marginLeft: '15px' }}
                  >
                    {e.displayName?.split('-')[e.displayName?.split('-')?.length - 1]}
                    <span className="ml-3">{e.userId == zmClient.getSessionInfo().userId && '( You )'}</span>
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Slide>
      )}

      <Box style={{ width: modalOpenClose ? '100vw' : '' }}>
        <ChatContainer
          modalOpenClose={modalOpenClose}
          setmodalOpenClose={setmodalOpenClose}
          setChatRecords={setChatRecords}
          chatRecords={chatRecords}
        />
      </Box>
      <VideoFooter
        className="video-operations"
        sharing
        shareRef={selfShareRef}
        setmodalOpenClose={setmodalOpenClose}
        modalOpenClose={modalOpenClose}
        setLinkShowCard={setLinkShowCard}
        LinkShowCard={LinkShowCard}
        chatRecords={chatRecords}
        StartStopRecording={StartStopRecording}
        RecordingStatus={RecordingStatus}
        handleselfView={handleselfView}
        // NewMsg={NewMsg}
        // videoRef={myVideoRef}
        setIsLoading={setIsLoading}
        setLoadingText={setLoadingText}
        SaveTranscript={SaveTranscript}
        setIncallMemberCard={setIncallMemberCard}
        settoggleViewScreenPort={settoggleViewScreenPort}
        toggleViewScreenPort={toggleViewScreenPort}
        inSharing={isSharing}
      />
    </div>
  );
};

export default VideoContainer;
