import React, { useContext, useEffect, useRef, useState } from 'react';
import { AudioMutedOutlined } from '@ant-design/icons';
import { Slider } from 'antd';
import classNames from 'classnames';
import './avatar.scss';
import { Participant } from '../../../index-types';
import ZoomContext from '../../../context/zoom-context';
import { useHover } from '../../../hooks';
import MicOffIcon from '@mui/icons-material/MicOff';

interface AvatarProps {
  participant: Participant;
  style?: { [key: string]: string };
  isActive: boolean;
  className?: string;
  volume?: number;
  setLocalVolume?: (userId: number, volume: number) => void;
}
const Avatar = (props: AvatarProps) => {
  const { participant, style, isActive, className, volume, setLocalVolume } = props;
  const { displayName, audio, muted, bVideoOn, userId } = participant;
  const avatarRef = useRef(null);
  const isHover = useHover(avatarRef);
  const zmClient = useContext(ZoomContext);
  const onSliderChange = (value: number) => {
    setLocalVolume?.(userId, value);
  };
  const [BGColor, setBGColor] = useState('');

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    if (!BGColor) {
      setBGColor(color);
    }
  }

  useEffect(() => {
    getRandomColor();
  }, []);
  return (
    <div
      className={classNames('avatar', { 'avatar-active': isActive }, className)}
      style={{
        ...style,
        borderRadius: '10px',
        background: bVideoOn ? 'transparent' : '#3c4043'
      }}
      ref={avatarRef}
    >
      {audio === 'computer' && muted && (
        <MicOffIcon
          fontSize="large"
          style={{
            fill: 'white',
            backgroundColor: '#34373a',
            position: 'absolute',
            top: '10px',
            right: '20px',
            padding: '7px',
            borderRadius: '30px'
          }}
        />
      )}
      {(bVideoOn || true || (audio === 'computer' && muted)) && (
        <div className="corner-name">
          {/* {audio === 'computer' && muted && <AudioMutedOutlined style={{ color: '#f00' }} />} */}
          {(bVideoOn || true) && <span>{displayName?.split('-')[displayName?.split('-')?.length - 1]}</span>}
        </div>
      )}
      {!bVideoOn && (
        <div
          style={{
            backgroundColor: BGColor,
            width: 'auto',
            minWidth: '10.5em',
            height: 'auto',
            borderRadius: '100px'
          }}
        >
          <p className="center-name">
            {displayName?.split('-')[displayName?.split('-')?.length - 1].split('')[0].toUpperCase()}
          </p>
        </div>
      )}
      {/* {isHover && audio === 'computer' && zmClient.getSessionInfo().userId !== userId && (
        <div className={classNames('avatar-volume')}>
          <label>Volume:</label>
          <Slider
            marks={{ 0: '0', 100: '100' }}
            tooltipVisible={true}
            defaultValue={100}
            onChange={onSliderChange}
            value={volume}
          />
        </div>
      )} */}
    </div>
  );
};

export default Avatar;
