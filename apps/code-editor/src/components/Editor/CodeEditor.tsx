import React, { useState, useEffect, useCallback, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import type { Language } from '../../types';

export interface CodeEditorProps {
  language: Language;
  value: string;
  onChange: (next: string) => void;
}

export default function CodeEditor(props: CodeEditorProps): React.ReactElement {
  const { language, value, onChange } = props;
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    // 使用localStorage作为第一优先级，确保主题一致性
    const savedTheme = localStorage.getItem('code-editor-theme');
    const domTheme = document.documentElement.getAttribute('data-theme');
    const theme = savedTheme || domTheme || 'dark';

    // 确保DOM和state同步
    if (domTheme !== theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }

    return theme;
  });

  const monacoLanguage = language === 'json' ? 'json' : 'typescript';

  // 优化的主题更新：直接更新Monaco主题而不重建编辑器
  useEffect(() => {
    const checkTheme = () => {
      const domTheme =
        document.documentElement.getAttribute('data-theme') || 'dark';

      if (domTheme !== currentTheme) {
        setCurrentTheme(domTheme);

        // 如果编辑器已准备好，直接更新主题
        if (isEditorReady && monacoRef.current && editorRef.current) {
          const monacoTheme = domTheme === 'light' ? 'vs' : 'vs-dark';
          monacoRef.current.editor.setTheme(monacoTheme);
        }
      }
    };

    // 立即检查一次
    checkTheme();

    // 监听DOM变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, [currentTheme, isEditorReady]);

  const beforeMount = useCallback(
    (monaco: Monaco) => {
      monacoRef.current = monaco;
      const monacoTheme = currentTheme === 'light' ? 'vs' : 'vs-dark';

      // 设置主题
      monaco.editor.setTheme(monacoTheme);

      // 全局类型补充：声明 React/ReactDOM 为全局
      const reactGlobals = [
        'declare const React: any;',
        'declare const ReactDOM: any;',
        "declare module 'react/jsx-runtime' { const anyExport: any; export = anyExport }",
        "declare module 'react/jsx-dev-runtime' { const anyExport: any; export = anyExport }",
      ].join('\n');

      try {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          reactGlobals,
          'file:///global-react.d.ts'
        );
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          reactGlobals,
          'file:///global-react.d.ts'
        );

        const compilerOptions = {
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          jsx: monaco.languages.typescript.JsxEmit.React,
          allowJs: true,
          allowNonTsExtensions: true,
          moduleResolution:
            monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          esModuleInterop: true,
          skipLibCheck: true,
          noEmit: true,
        };

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
          compilerOptions
        );
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
          compilerOptions as any
        );

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
      } catch (error) {
        console.warn('Monaco setup error:', error);
      }
    },
    [currentTheme]
  );

  const onMount = useCallback(
    (editor: any, monaco: Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      setIsEditorReady(true);

      const monacoTheme = currentTheme === 'light' ? 'vs' : 'vs-dark';
      monaco.editor.setTheme(monacoTheme);
    },
    [currentTheme]
  );

  const handleChange = useCallback(
    (val: string | undefined) => {
      onChange(val || '');
    },
    [onChange]
  );

  return (
    <div className="editor-wrapper">
      <MonacoEditor
        language={monacoLanguage}
        value={value}
        onChange={handleChange}
        beforeMount={beforeMount}
        onMount={onMount}
        options={{
          fontSize: 14,
          lineHeight: 1.5,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          fontLigatures: false,
          wordWrap: 'on',
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 50 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          contextmenu: true,
          formatOnPaste: true,
          formatOnType: true,
          cursorBlinking: 'blink',
          cursorSmoothCaretAnimation: 'off',
          smoothScrolling: false,
          mouseWheelZoom: true,
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          renderWhitespace: 'selection',
          renderControlCharacters: false,
          renderLineHighlight: 'all',
          roundedSelection: false,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          // 性能优化选项
          readOnly: false,
          domReadOnly: false,
          renderValidationDecorations: 'on',
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          foldingStrategy: 'auto',
          showFoldingControls: 'mouseover',
          unfoldOnClickAfterEndOfLine: false,
        }}
      />
    </div>
  );
}
