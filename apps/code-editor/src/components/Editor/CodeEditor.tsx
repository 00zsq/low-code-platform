/**
 * Monaco代码编辑器组件
 *
 * 功能特性：
 * - 支持JSON和TypeScript语法高亮
 * - 智能代码补全和错误检查
 * - 主题切换（明暗主题）
 * - React/JSX类型定义支持
 * - 实时主题同步
 * - 性能优化的配置
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import type { Language } from '../../types';

// 代码编辑器组件属性接口
export interface CodeEditorProps {
  language: Language; // 编程语言模式
  value: string; // 当前代码内容
  onChange: (next: string) => void; // 代码变更回调
}

export default function CodeEditor(props: CodeEditorProps): React.ReactElement {
  const { language, value, onChange } = props;
  const editorRef = useRef<any>(null); // Monaco编辑器实例引用
  const monacoRef = useRef<Monaco | null>(null); // Monaco API引用
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

  // 将应用语言模式映射到Monaco编辑器语言
  const monacoLanguage = language === 'json' ? 'json' : 'typescript';

  // 监听主题变化并同步到Monaco编辑器
  // 优化：直接更新Monaco主题而不重建编辑器实例
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

  /**
   * Monaco编辑器挂载前的配置
   * 设置主题、类型定义、编译选项等
   */
  const beforeMount = useCallback(
    (monaco: Monaco) => {
      monacoRef.current = monaco;
      const monacoTheme = currentTheme === 'light' ? 'vs' : 'vs-dark';

      // 设置编辑器主题
      monaco.editor.setTheme(monacoTheme);

      // 为TypeScript模式添加React全局类型定义
      // 这样用户就可以直接使用React和ReactDOM而无需导入
      const reactGlobals = [
        'declare const React: any;',
        'declare const ReactDOM: any;',
        "declare module 'react/jsx-runtime' { const anyExport: any; export = anyExport }",
        "declare module 'react/jsx-dev-runtime' { const anyExport: any; export = anyExport }",
      ].join('\n');

      try {
        // 添加React类型定义到TypeScript和JavaScript环境
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          reactGlobals,
          'file:///global-react.d.ts'
        );
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          reactGlobals,
          'file:///global-react.d.ts'
        );

        // 配置TypeScript编译选项，支持现代JS特性和JSX
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

  /**
   * Monaco编辑器挂载完成回调
   * 保存编辑器实例引用并标记为就绪状态
   */
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

  // 处理代码内容变更
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
