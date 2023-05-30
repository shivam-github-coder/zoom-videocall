import { useState, useCallback, useEffect, useContext } from 'react';
import { maxViewportVideoCounts } from '../video-layout-helper';
import { useMount } from '../../../hooks';
import { Dimension } from '../video-types';
import { ZoomClient } from '../../../index-types';
import { isAndroidOrIOSBrowser } from '../../../utils/platform';
import ZoomMediaContext from '../../../context/media-context';
const MAX_NUMBER_PER_PAGE = 9;
// eslint-disable-next-line import/prefer-default-export
export function usePagination(zmClient: ZoomClient, dimension: Dimension, selfViewGalleryLayout?: any) {
  const [page, setPage] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [pageSize, setPageSize] = useState(MAX_NUMBER_PER_PAGE);
  const { mediaStream } = useContext(ZoomMediaContext);
  useEffect(() => {
    const size = Math.min(MAX_NUMBER_PER_PAGE, maxViewportVideoCounts(dimension.width, dimension.height));
    setPageSize(size);
  }, [dimension, selfViewGalleryLayout]);
  const onParticipantsChange = useCallback(() => {
    setTotalSize(zmClient.getAllUser().length);
  }, [zmClient]);
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
    if (selfViewGalleryLayout) {
      setTotalSize((prev) => prev - 1);
    } else {
      setTotalSize(zmClient.getAllUser().length);
    }
  }, [selfViewGalleryLayout]);

  // useEffect(() => {
  //   if (isAndroidOrIOSBrowser() && zmClient.getAllUser().length > 1) {
  //     setTotalSize((prev) => prev - 1);
  //   }
  // }, [zmClient.getAllUser().length]);

  useEffect(() => {
    console.log("calllledddddddddd",totalSize)
    if(selfViewGalleryLayout && zmClient.getAllUser().length === 1){
      setTotalSize(0)
    }else if(selfViewGalleryLayout && zmClient.getAllUser().length - 1 !== totalSize ){
      setTotalSize(zmClient.getAllUser().length - 1);
    }
  }, [totalSize,zmClient.getAllUser().length, mediaStream?.isCapturingVideo(), mediaStream?.isAudioMuted()])
  

  useMount(() => {
    setTotalSize(zmClient.getAllUser().length);
  });
  return {
    page,
    totalPage: Math.ceil(totalSize / pageSize),
    pageSize,
    totalSize,
    setPage
  };
}
