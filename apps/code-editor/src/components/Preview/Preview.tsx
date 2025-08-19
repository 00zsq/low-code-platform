import React from 'react';
import type { PreviewProps } from '../../types';
import DeviceFrame from '../UI/DeviceFrame';
import ReactPreview from './ReactPreview';
import JsonPreview from './JsonPreview';

export default function Preview({ language, code, orientation }: PreviewProps): React.ReactElement {
  return (
    <div className="preview-root">
      <DeviceFrame orientation={orientation}>
        {language === 'json' ? (
          <JsonPreview code={code} />
        ) : (
          <ReactPreview code={code} />
        )}
      </DeviceFrame>
    </div>
  );
} 