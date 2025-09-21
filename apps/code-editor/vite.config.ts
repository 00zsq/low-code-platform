/**
 * Vite构建配置文件
 *
 * 配置了代码编辑器应用的构建参数：
 * - React支持
 * - qiankun微前端集成
 * - 开发服务器配置
 * - 跨域访问支持
 * - 构建优化配置
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    react(), // React支持插件
    qiankun('code-editor-app', {
      // qiankun微前端插件
      useDevMode: true, // 开发模式，支持热更新
    }),
  ],
  // 开发服务器配置
  server: {
    port: 3002, // 服务端口
    cors: true, // 启用CORS支持
    origin: 'http://localhost:3002', // 服务器源地址
    headers: {
      // 跨域访问头配置，支持微前端集成
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
  base: '/', // 基础路径
  // 构建配置
  build: {
    rollupOptions: {
      external: [], // 外部依赖（空表示打包所有依赖）
      output: {
        manualChunks: undefined, // 自动分块
        // 输出文件命名规则
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  // 全局变量定义
  define: {
    global: 'globalThis', // 全局对象兼容性
    __DEV__: JSON.stringify(true), // 开发模式标识
    'process.env.NODE_ENV': JSON.stringify('development'), // Node.js环境变量
  },
  // 依赖优化配置
  optimizeDeps: {
    include: ['react', 'react-dom'], // 预构建依赖，提高开发时的加载速度
  },
});
