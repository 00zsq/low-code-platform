import React from 'react';
import type { Orientation } from '../../types';

interface DeviceFrameProps {
  orientation: Orientation;
  children: React.ReactNode;
}

export default function DeviceFrame({ orientation, children }: DeviceFrameProps): React.ReactElement {
  const size =
    orientation === 'portrait'
      ? { width: 390, height: 844 }
      : { width: 844, height: 390 };

  return (
    <div
      className={`device-frame ${orientation}`}
      style={{ 
        width: size.width + 24, 
        height: size.height + 24,
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <div 
        className="device-notch" 
        style={{
          width: orientation === 'portrait' ? 140 : 100,
          height: orientation === 'portrait' ? 20 : 16,
          transition: 'all 0.3s ease-in-out',
        }}
      />
      <div
        className="device-screen"
        style={{ 
          width: size.width, 
          height: size.height,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {children}
      </div>
    </div>
  );
} 