import React, { useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ZoomVideo, { MobileVideoFacingMode, VideoCapturingState, VideoQuality } from '@zoom/videosdk';
import classnames from 'classnames';
import _ from 'lodash';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import Avatar from './components/avatar';
import VideoFooter from './components/video-footer';
import { useShare } from './hooks/useShare';
import { useParticipantsChange } from './hooks/useParticipantsChange';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { useMount, useSizeCallback } from '../../hooks';
import { Participant } from '../../index-types';
import './video.scss';
import {
  isAndroidBrowser,
  isAndroidOrIOSBrowser,
  isSupportOffscreenCanvas,
  isSupportWebCodecs
} from '../../utils/platform';
import { SELF_VIDEO_ID } from './video-constants';
import { isShallowEqual } from '../../utils/util';
import { useLocalVolume } from './hooks/useLocalVolume';
import { Box, IconButton, Slide, Typography } from '@material-ui/core';
import { Alert, Divider } from '@mui/material';
import ChatContainer from '../chat/chat';
import axios from 'axios';
import { getQueryString } from '../../Api';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import nosleep from 'nosleep.js';
import useStayAwake from 'use-stay-awake';

import { ChatRecord } from '../chat/chat-types';
import { AnyArray } from 'immer/dist/internal';
import { useGalleryLayout } from './hooks/useGalleryLayout';
import { usePagination } from './hooks/usePagination';
import DemoTabs from './components/DemoTabs';
import BasicCard from '../../component/pages/Linkcard';
import mobile from 'is-mobile';
import { url } from '../../App';
import CloseIcon from '@mui/icons-material/Close';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import usePictureInPicture from 'react-use-pip';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';

const isUseVideoElementToDrawSelfVideo = isAndroidBrowser() || (isSupportOffscreenCanvas() && isSupportWebCodecs());

interface VideoProps extends RouteComponentProps {
  DisplayDataInfo?: any;
  setIsLoading?: Function;
  setLoadingText?: Function;
  SaveTranscript: any;
}

const VideoContainer: React.FunctionComponent<VideoProps> = (props) => {
  const { DisplayDataInfo, setIsLoading, setLoadingText, SaveTranscript } = props;
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const shareRef = useRef<HTMLCanvasElement | null>(null);
  const selfShareRef = useRef<HTMLCanvasElement & HTMLVideoElement>(null);
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeVideo, setActiveVideo] = useState<number>(0);
  const previousActiveUser = useRef<Participant>();
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(zmClient, mediaStream, shareRef);
  const isSharing = isRecieveSharing || isStartedShare;
  const [containerDimension, setContainerDimension] = useState({
    width: 0,
    height: 0
  });
  const [shareViewDimension, setShareViewDimension] = useState({
    width: 0,
    height: 0
  });
  const { userVolumeList, setLocalVolume } = useLocalVolume();
  const PIPRef = useRef(null);
  const { isPictureInPictureActive, isPictureInPictureAvailable, togglePictureInPicture } = usePictureInPicture(PIPRef);

  const [NewMsg, setNewMsg] = useState(false);
  var noSleep = new nosleep();
  const device = useStayAwake();
  const [ShowAlert, setShowAlert] = useState(false);
  const [RenderShowHide, setRenderShowHide] = useState(false);
  const [AllvisibleParticipants, setAllvisibleParticipants] = useState<AnyArray>([]);
  const { enqueueSnackbar } = useSnackbar();
  const RecordingZoomApi: any = zmClient?.getRecordingClient();
  var UserId = localStorage.getItem('UserID');
  const [modalOpenClose, setmodalOpenClose] = useState(false);
  const [LinkShowCard, setLinkShowCard] = useState(false);
  const [chatRecords, setChatRecords] = useState<ChatRecord[]>([]);
  const [RecordingStatus, setRecordingStatus] = useState(false);
  const [selfViewGalleryLayout, setselfViewGalleryLayout] = useState(false);
  const myVideoRef = useRef<HTMLCanvasElement | null>(null);
  const [IncallMemberCard, setIncallMemberCard] = useState(false);

  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(zmClient, canvasDimension);
  const { visibleParticipants, layout: videoLayout } = useGalleryLayout(
    zmClient,
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    canvasDimension,
    {
      page,
      pageSize,
      totalPage,
      totalSize
    }
  );

  useParticipantsChange(zmClient, (payload) => {
    setParticipants(payload);
  });
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

  var isMobile = mobile();

  const activeUser = useMemo(
    () => participants.find((user) => user.userId === activeVideo && user.userId !== zmClient.getSessionInfo().userId),
    [participants, activeVideo]
  );
  const isCurrentUserStartedVideo = zmClient.getCurrentUserInfo()?.bVideoOn &&  participants.length === 1;
  console.log("zmClient.getCurrentUserInfo()",zmClient.getCurrentUserInfo())
  useEffect(() => {
    if (mediaStream && videoRef.current && isVideoDecodeReady) {
      if (activeUser?.bVideoOn !== previousActiveUser.current?.bVideoOn) {
        if (activeUser?.bVideoOn) {
          mediaStream.renderVideo(
            videoRef.current,
            activeUser.userId,
            canvasDimension.width,
            canvasDimension.height,
            0,
            0,
            VideoQuality.Video_360P as any
          );
        } else {
          if (previousActiveUser.current?.bVideoOn) {
            mediaStream.stopRenderVideo(videoRef.current, previousActiveUser.current?.userId);
          }
        }
      }
      if (
        activeUser?.bVideoOn &&
        previousActiveUser.current?.bVideoOn &&
        activeUser.userId !== previousActiveUser.current.userId
      ) {
        mediaStream.stopRenderVideo(videoRef.current, previousActiveUser.current?.userId);
        mediaStream.renderVideo(
          videoRef.current,
          activeUser.userId,
          canvasDimension.width,
          canvasDimension.height,
          0,
          0,
          VideoQuality.Video_360P as any
        );
      }
      previousActiveUser.current = activeUser;
    }
  }, [mediaStream, activeUser, isVideoDecodeReady, canvasDimension]);
  useMount(() => {
    if (mediaStream) {
      setActiveVideo(mediaStream.getActiveVideoId());
    }
  });
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
    // noSleep.enable();
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

  const info = {
    ...zmClient.getSessionInfo()
  };
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

  useEffect(() => {
    if (ShowAlert) {
      setTimeout(() => {
        setShowAlert(false);
      }, 1000);
    }
  }, [ShowAlert]);

  const handleselfView = async (data: any) => {
    if (data) {
      setShowAlert(true);
      setselfViewGalleryLayout(true);
      var index = visibleParticipants.findIndex((e: any) => e.userId === info.userId);
      AllvisibleParticipants.push(visibleParticipants[index]);
      setRenderShowHide(true);
      visibleParticipants.splice(index, 1);
    } else {
      setselfViewGalleryLayout(false);
      visibleParticipants.push(AllvisibleParticipants[0]);
      setRenderShowHide(false);
      setAllvisibleParticipants([]);
    }
  };

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  var localVideo = ZoomVideo.createLocalVideoTrack();

  const ToggleCamera = async () => {
    if (mediaStream) {
      await mediaStream.switchCamera(
        mediaStream.getActiveCamera() === MobileVideoFacingMode.User
          ? MobileVideoFacingMode.Environment
          : MobileVideoFacingMode.User
      );
    }
  };

  const [IsCameraActive, setIsCameraActive] = useState(false);

  const PIPMode = () => {
    togglePictureInPicture(!isPictureInPictureActive);
  };

  const onVideoCaptureChange = useCallback(async (payload: any) => {
    if (payload.state === VideoCapturingState.Started) {
      setIsCameraActive(true);
    } else {
      setIsCameraActive(false);
    }
  }, []);

  useEffect(() => {
    zmClient.on('video-capturing-change', onVideoCaptureChange);
    return () => {
      zmClient.off('video-capturing-change', onVideoCaptureChange);
    };
  }, [zmClient, onVideoCaptureChange]);

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
      >
        <canvas className="video-canvas" id="video-canvas" width="800" height="600" ref={videoRef} />
        {isUseVideoElementToDrawSelfVideo ? (
          <video
            ref={PIPRef}
            id={SELF_VIDEO_ID}
            className={classnames(
              `self-video`,
              {
                'single-self-video': participants.length === 1,
                'self-video-show': isCurrentUserStartedVideo
              }
            )}
          />
        ) : (
          <canvas
            ref={PIPRef}
            id={SELF_VIDEO_ID}
            width="254"
            height="143"
            className={classnames(
              `self-video`,
              {
                'single-self-video': participants.length === 1,
                'self-video-show': isCurrentUserStartedVideo
              }
            )}
          />
        )}
        {activeUser && (
          <Avatar
            participant={activeUser}
            isActive={false}
            className="single-view-avatar"
            volume={userVolumeList.find((u) => u.userId === activeUser.userId)?.volume}
            setLocalVolume={setLocalVolume}
          />
        )}
      </div>
      <Slide direction="left" in={ShowAlert} mountOnEnter unmountOnExit>
        <Box>
          <Alert>Hide Self View</Alert>
        </Box>
      </Slide>

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
        NewMsg={NewMsg}
        videoRef={myVideoRef}
        setIsLoading={setIsLoading}
        setLoadingText={setLoadingText}
        SaveTranscript={SaveTranscript}
        setIncallMemberCard={setIncallMemberCard}
      />
    </div>
  );
};

export default VideoContainer;
