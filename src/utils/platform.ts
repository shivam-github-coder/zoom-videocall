// eslint-disable-next-line import/prefer-default-export
export function getExploreName() {
  const { userAgent } = navigator;
  if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera';
  }
  if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1) {
    return 'IE';
  }
  if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }
  if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  }
  if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    return 'Safari';
  }
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1) {
    return 'Chrome';
  }
  if (!!(window as any).ActiveXObject || 'ActiveXObject' in window) {
    return 'IE>=11';
  }
  return 'Unkonwn';
}

export function get_browser() {
  var ua = navigator.userAgent,
    tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: 'IE', version: tem[1] || '' };
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR|Edge\/(\d+)/);
    if (tem != null) {
      return { name: 'Opera', version: tem[1] };
    }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1]);
  }
  return {
    name: M[0],
    version: M[1]
  };
}

export function getWindowOS() {
  if (navigator.appVersion.indexOf('Win') != -1) return 'Windows OS';
  if (navigator.appVersion.indexOf('Mac') != -1) return 'MacOS';
  if (navigator.appVersion.indexOf('X11') != -1) return 'UNIX OS';
  if (navigator.appVersion.indexOf('Linux') != -1) return 'Linux OS';
}

export function isSupportWebCodecs() {
  return typeof (window as any).MediaStreamTrackProcessor === 'function';
}
const isIPad = () => {
  return /MacIntel/i.test(navigator.platform) && navigator?.maxTouchPoints > 2;
};
export const isIOSMobile = () => {
  const { userAgent } = navigator;
  const isIOS = /iPad|iPhone|iPod/i.test(userAgent);
  return isIOS || isIPad();
};

export function isAndroidBrowser() {
  return /android/i.test(navigator.userAgent);
}
export function isAndroidOrIOSBrowser() {
  return isAndroidBrowser() || isIOSMobile();
}
export function isSupportOffscreenCanvas() {
  return typeof (window as any).OffscreenCanvas === 'function';
}
