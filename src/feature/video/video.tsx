import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { RouteComponentProps } from 'react-router-dom';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import Avatar from './components/avatar';
import VideoFooter from './components/video-footer';
import Pagination from './components/pagination';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { useGalleryLayout } from './hooks/useGalleryLayout';
import { usePagination } from './hooks/usePagination';
import { useActiveVideo } from './hooks/useAvtiveVideo';
import { useShare } from './hooks/useShare';
import { useLocalVolume } from './hooks/useLocalVolume';
import './video.scss';
import { isSupportWebCodecs } from '../../utils/platform';
import { isShallowEqual } from '../../utils/util';
import { useSizeCallback } from '../../hooks/useSizeCallback';
import { ChatRecord } from '../chat/chat-types';
import { useSnackbar } from 'notistack';
import { getQueryString } from '../../Api';
import axios from 'axios';
import moment from 'moment';
import { AnyArray } from 'immer/dist/internal';
import { Box, Slide } from '@material-ui/core';
import ChatContainer from '../chat/chat';
import { Alert, IconButton } from '@mui/material';
import BasicCard from '../../component/pages/Linkcard';
import nosleep from 'nosleep.js';
import { SELF_VIDEO_ID } from './video-constants';
import useStayAwake from 'use-stay-awake';

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
  const selfShareRef = useRef<(HTMLCanvasElement & HTMLVideoElement) | null>(null);
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDimension, setContainerDimension] = useState({
    width: 0,
    height: 0
  });
  const [shareViewDimension, setShareViewDimension] = useState({
    width: 0,
    height: 0
  });
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);

  const [modalOpenClose, setmodalOpenClose] = useState(false);
  const [LinkShowCard, setLinkShowCard] = useState(true);
  const [chatRecords, setChatRecords] = useState<ChatRecord[]>([]);
  const [RecordingStatus, setRecordingStatus] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const RecordingZoomApi: any = zmClient?.getRecordingClient();
  var UserId = localStorage.getItem('UserID');
  const [selfViewGalleryLayout, setselfViewGalleryLayout] = useState(false);
  const [ShowAlert, setShowAlert] = useState(false);
  const [RenderShowHide, setRenderShowHide] = useState(false);
  const [AllvisibleParticipants, setAllvisibleParticipants] = useState<AnyArray>([]);
  const myVideoRef = useRef<HTMLCanvasElement | null>(null);
  const [NewMsg, setNewMsg] = useState(false);
  var noSleep = new nosleep();
  const device = useStayAwake();

  const activeVideo = useActiveVideo(zmClient);
  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(
    zmClient,
    canvasDimension,
    selfViewGalleryLayout
  );
  const {
    visibleParticipants,
    layout: videoLayout,
    setSelfVideoToggle
  } = useGalleryLayout(zmClient, mediaStream, isVideoDecodeReady, videoRef, canvasDimension, {
    page,
    pageSize,
    totalPage,
    totalSize
  });
  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(zmClient, mediaStream, shareRef);

  const { userVolumeList, setLocalVolume } = useLocalVolume();

  const isSharing = isRecieveSharing || isStartedShare;
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

  const participants = zmClient.getAllUser();

  useEffect(() => {
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
            enqueueSnackbar('Transcript Started', { variant: 'info' });
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
            enqueueSnackbar('Transcript Started', { variant: 'info' });
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
            enqueueSnackbar('Transcript Stoped', { variant: 'info' });
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
      await setSelfVideoToggle(data);
      // setShowAlert(true);
      enqueueSnackbar('Hide Self View', { variant: 'info' });
      setselfViewGalleryLayout(data);
      // var index = await visibleParticipants.findIndex((e: any) => e.userId === info.userId);
      // AllvisibleParticipants.push(visibleParticipants[index]);
      // await visibleParticipants.splice(index, 1);
      // setRenderShowHide(true);
      // console.log(index, visibleParticipants);
    } else {
      setSelfVideoToggle(data);
      enqueueSnackbar('Show Self View', { variant: 'info' });
      setselfViewGalleryLayout(data);
      await mediaStream?.renderVideo(
        videoRef.current as HTMLCanvasElement,
        zmClient.getSessionInfo().userId,
        254,
        143,
        0,
        0,
        3
      );
      // visibleParticipants.push(AllvisibleParticipants[0]);
      // setRenderShowHide(false);
      // setAllvisibleParticipants([]);
    }
  };

  return (
    <div className="viewport">
      {LinkShowCard && (
        <BasicCard setLinkShowCard={setLinkShowCard} LinkShowCard={LinkShowCard} DisplayDataInfo={DisplayDataInfo} />
      )}
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
          <canvas className={classnames('share-canvas', { hidden: isStartedShare })} ref={shareRef} />
          {isSupportWebCodecs() ? (
            <video
              className={classnames('share-canvas', {
                hidden: isRecieveSharing
              })}
              ref={selfShareRef}
            />
          ) : (
            <canvas
              className={classnames('share-canvas', {
                hidden: isRecieveSharing
              })}
              ref={selfShareRef}
            />
          )}
        </div>
      </div>
      <div
        className={classnames('video-container', {
          'in-sharing': isSharing
        })}
      >
        <canvas className="video-canvas" id="video-canvas" width="800" height="600" ref={videoRef} />
        <ul className="avatar-list">
          {visibleParticipants.map((user, index) => {
            if (index > videoLayout.length - 1) {
              return null;
            }
            const dimension = videoLayout[index];
            const { width, height, x, y } = dimension;
            const { height: canvasHeight } = canvasDimension;
            return (
              <Avatar
                participant={user}
                key={user.userId}
                isActive={activeVideo === user.userId}
                volume={userVolumeList.find((u) => u.userId === user.userId)?.volume}
                setLocalVolume={setLocalVolume}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  top: `${canvasHeight - y - height}px`,
                  left: `${x}px`
                }}
              />
            );
          })}
        </ul>
      </div>

      {/* <Slide direction="left" in={ShowAlert} mountOnEnter unmountOnExit>
        <Box>
          <Alert>Hide Self View</Alert>
        </Box>
      </Slide> */}

      <Box>
        <ChatContainer
          modalOpenClose={modalOpenClose}
          setmodalOpenClose={setmodalOpenClose}
          setChatRecords={setChatRecords}
          chatRecords={chatRecords}
        />
      </Box>
      {/* <VideoFooter className="video-operations" sharing shareRef={selfShareRef} /> */}
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
      />
      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} setPage={setPage} inSharing={isSharing} />}
    </div>
  );
};

export default VideoContainer;
