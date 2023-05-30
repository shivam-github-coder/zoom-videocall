import { useCallback, useEffect, useState, MutableRefObject } from 'react';
import { getVideoLayout } from '../video-layout-helper';
import { useRenderVideo } from './useRenderVideo';
import { Dimension, Pagination, CellLayout } from '../video-types';
import { ZoomClient, MediaStream, Participant } from '../../../index-types';
import { isAndroidOrIOSBrowser } from '../../../utils/platform';
/**
 * Default order of video:
 *  1. video's participants first
 *  2. self on the second position
 */
export function useGalleryLayout(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  isVideoDecodeReady: boolean,
  videoRef: MutableRefObject<HTMLCanvasElement | null>,
  dimension: Dimension,
  pagination: Pagination
) {
  const [visibleParticipants, setVisibleParticipants] = useState<Participant[]>([]);
  const [layout, setLayout] = useState<CellLayout[]>([]);
  const [subscribedVideos, setSubscribedVideos] = useState<number[]>([]);
  const [SelfVideoToggle, setSelfVideoToggle] = useState(false);
  const { page, pageSize, totalPage, totalSize } = pagination;
  let size = pageSize;
  if (page === totalPage - 1) {
    size = Math.min(size, totalSize % pageSize || size);
  }

  // useEffect(() => {
  //   if (totalSize == visibleParticipants?.length) {
  //     console.log('vvvvv', totalSize, visibleParticipants?.length);
  //     const index = zmClient.getAllUser().findIndex((user) => user.userId === zmClient.getSessionInfo().userId);
  //     const cellDimension = layout[index];
  //     console.log('cellDimension', cellDimension);
  //     // if (cellDimension) {
  //     const { width, height, x, y, quality } = cellDimension;
  //     mediaStream?.renderVideo(
  //       videoRef.current as HTMLCanvasElement,
  //       zmClient.getSessionInfo().userId,
  //       254,
  //       143,
  //       0,
  //       0,
  //       3
  //     );
  //   }
  // }, [visibleParticipants?.length, totalSize]);

  useEffect(() => {
    setLayout(getVideoLayout(dimension.width, dimension.height, size));
  }, [dimension, size, SelfVideoToggle]);
  const onParticipantsChange = useCallback(() => {
    const currentUser = zmClient.getCurrentUserInfo();
    const participants = zmClient.getAllUser();
    if (currentUser && participants.length > 0) {
      let pageParticipants: any[] = [];
      if (participants.length === 1) {
        pageParticipants = participants;
      } else {
        pageParticipants = participants
          .filter((user) => user.userId !== currentUser.userId)
          .sort((user1, user2) => Number(user2.bVideoOn) - Number(user1.bVideoOn));
        pageParticipants.splice(1, 0, currentUser);
        pageParticipants = pageParticipants.filter((_user, index) => Math.floor(index / pageSize) === page);
      }
      setVisibleParticipants(pageParticipants);
      const videoParticipants = pageParticipants.filter((user) => user.bVideoOn).map((user) => user.userId);
      setSubscribedVideos(videoParticipants);
    }
  }, [zmClient, page, pageSize]);
  useEffect(() => {
    console.log('first=====>>>>>>>>>>>');
    if (SelfVideoToggle) {
      var index = visibleParticipants.findIndex((e: any) => e.userId === zmClient.getCurrentUserInfo().userId);
      if (index) {
        visibleParticipants.splice(index, 1);
      }
    } else {
      onParticipantsChange();
    }
  }, [SelfVideoToggle]);

  useEffect(() => {
    if (SelfVideoToggle) {
      var index = visibleParticipants.findIndex((e: any) => e.userId === zmClient.getCurrentUserInfo().userId);
      if (index >= 0) {
        visibleParticipants.splice(index, 1);
      }
    }
  }, [visibleParticipants?.length,zmClient.getAllUser().length]);

  useEffect(() => {
    zmClient.on('user-added', onParticipantsChange);
    zmClient.on('user-removed', onParticipantsChange);
    zmClient.on('user-updated', onParticipantsChange);
    return () => {
      zmClient.off('user-added', onParticipantsChange);
      zmClient.off('user-removed', onParticipantsChange);
      zmClient.off('user-updated', onParticipantsChange);
    };
  }, [zmClient, onParticipantsChange]);
  useEffect(() => {
    onParticipantsChange();
  }, [onParticipantsChange]);

  useRenderVideo(
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    subscribedVideos,
    visibleParticipants,
    zmClient.getCurrentUserInfo()?.userId,
    SelfVideoToggle
  );
  return {
    visibleParticipants,
    layout,
    setSelfVideoToggle
  };
}
