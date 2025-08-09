import React from 'react';
import MonacoEditor, { type Monaco } from '@monaco-editor/react';

export interface CodeEditorProps {
  language: 'json' | 'tsx';
  value: string;
  onChange: (next: string) => void;
}

export default function CodeEditor(props: CodeEditorProps): React.ReactElement {
  const { language, value, onChange } = props;

  const monacoLanguage = language === 'json' ? 'json' : 'typescript';
  const path = language === 'json' ? 'file.json' : 'file.tsx';

  const beforeMount = (monaco: Monaco) => {
    // 全局类型补充：声明 React/ReactDOM 为全局
    const reactGlobals = [
      'declare const React: any;',
      'declare const ReactDOM: any;',
      "declare module 'react/jsx-runtime' { const anyExport: any; export = anyExport }",
      "declare module 'react/jsx-dev-runtime' { const anyExport: any; export = anyExport }",
    ].join('\n');
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactGlobals,
      'file:///global-react.d.ts'
    );
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      reactGlobals,
      'file:///global-react.d.ts'
    );

    // 经典 JSX 模式，避免依赖 react/jsx-runtime 的类型解析
    const compilerOptions = {
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
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
  };

  return (
    <div className="editor-wrapper">
      <MonacoEditor
        beforeMount={beforeMount}
        path={path}
        language={monacoLanguage}
        value={value}
        onChange={(val) => onChange(val ?? '')}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          tabSize: 2,
          insertSpaces: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          smoothScrolling: true,
        }}
        theme="vs-dark"
        height="100%"
      />
    </div>
  );
}
