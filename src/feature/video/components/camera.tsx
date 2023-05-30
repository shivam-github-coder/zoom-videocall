import { useContext } from 'react';
import { Button, Tooltip, Menu, Dropdown } from 'antd';
import { CheckOutlined, UpOutlined, VideoCameraAddOutlined, VideoCameraOutlined } from '@ant-design/icons';
import ZoomMediaContext from '../../../context/media-context';
import classNames from 'classnames';
import './camera.scss';
import { MediaDevice } from '../video-types';
import { IconButton } from '@material-ui/core';

import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';

interface CameraButtonProps {
  isStartedVideo: boolean;
  isMirrored?: boolean;
  isBlur?: boolean;
  onCameraClick: (isStartedVideo?: boolean) => void;
  onSwitchCamera: (deviceId: string) => void;
  onMirrorVideo?: () => void;
  onVideoStatistic?: () => void;
  onBlurBackground?: () => void;
  className?: string;
  cameraList?: MediaDevice[];
  activeCamera?: string;
  HideSelfView?: any;
}
const CameraButton = (props: CameraButtonProps) => {
  const {
    isStartedVideo,
    className,
    cameraList,
    activeCamera,
    isMirrored,
    isBlur,
    onCameraClick,
    onSwitchCamera,
    onMirrorVideo,
    onVideoStatistic,
    onBlurBackground,
    HideSelfView
  } = props;
  const { mediaStream } = useContext(ZoomMediaContext);
  const onMenuItemClick = (payload: { key: any }) => {
    if (payload.key === 'mirror') {
      onMirrorVideo?.();
    } else if (payload.key === 'statistic') {
      onVideoStatistic?.();
    } else if (payload.key === 'blur') {
      onBlurBackground?.();
    } else {
      onSwitchCamera(payload.key);
    }
  };
  const menu = cameraList && cameraList.length > 0 && (
    <Menu onClick={onMenuItemClick} theme="dark" className="camera-menu">
      <Menu.ItemGroup title="Select a Camera">
        {cameraList.map((item) => (
          <Menu.Item key={item.deviceId} icon={item.deviceId === activeCamera && <CheckOutlined />}>
            {item.label}
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.Item key="mirror" icon={isMirrored && <CheckOutlined />}>
        Mirror My Video
      </Menu.Item>
      {mediaStream?.isSupportVirtualBackground() && (
        <Menu.Item key="blur" icon={isBlur && <CheckOutlined />}>
          Blur My Background
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="statistic">Video Statistic</Menu.Item>
    </Menu>
  );
  return (
    <div className={classNames('camera-footer', className)}>
      <Tooltip title={`${isStartedVideo ? 'stop camera' : 'start camera'}`}>
        {/* <Button
          className={classNames("camere-button", className)}
          icon={
            isStartedVideo ? (
              <VideoCameraOutlined />
            ) : (
              <VideoCameraAddOutlined />
            )
          }
          ghost={true}
          shape="circle"
          size="large"
          onClick={onCameraClick}
        /> */}
        <IconButton
          // disabled={HideSelfView}
          className={classNames(isStartedVideo ? 'camere-button ml-3' : 'camere-button ml-3', className)}
          style={{
            backgroundColor: !isStartedVideo ? '#ea4335 ' : '#3c4043'
            // , opacity: HideSelfView ? 0.5 : 1
          }}
          onClick={() => onCameraClick(isStartedVideo)}
        >
          {isStartedVideo ? (
            <VideocamOutlinedIcon style={{ fill: '#fff' }} />
          ) : (
            <VideocamOffOutlinedIcon style={{ fill: '#fff' }} />
          )}
        </IconButton>
      </Tooltip>
      {/* {isStartedVideo && menu ? (
        <Dropdown.Button
          className="camera-dropdown-button"
          size="large"
          overlay={menu}
          onClick={onCameraClick}
          trigger={['click']}
          type="ghost"
          icon={<UpOutlined />}
          placement="topRight"
        >
          <VideoCameraOutlined />
        </Dropdown.Button>
      ) : (
        <Tooltip title={`${isStartedVideo ? 'stop camera' : 'start camera'}`}>
          <Button
            className={classNames('camere-button', className)}
            icon={isStartedVideo ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
            ghost={true}
            shape="circle"
            size="large"
            onClick={onCameraClick}
          />
        </Tooltip>
      )} */}
    </div>
  );
};
export default CameraButton;
