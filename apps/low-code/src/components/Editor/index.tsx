import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MaterialPanel from './MaterialPanel/MaterialPanel';
import Canvas from './Canvas/Canvas';
import PropertyPanel from './PropertyPanel/PropertyPanel';
import Toolbar from './Toolbar/Toolbar';
import styles from './index.module.css';

const Editor: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.editorContainer}>
        <Toolbar />
        
        <div className={styles.contentContainer}>
          <div className={styles.materialPanel}>
            <MaterialPanel />
          </div>
          <div className={styles.canvas}>
            <Canvas />
          </div>
          <div className={styles.propertyPanel}>
            <PropertyPanel />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Editor;