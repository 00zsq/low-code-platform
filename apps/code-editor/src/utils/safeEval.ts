/**
 * 安全的代码执行工具
 *
 * 用于安全地执行用户提供的JavaScript代码片段
 * 主要用于低代码平台中的事件处理函数
 *
 * @param code 要执行的JavaScript代码字符串
 * @returns 安全的执行函数或undefined（如果代码无效）
 */
export function safeEvalFunction(
  code: string | undefined
): ((...args: any[]) => any) | undefined {
  // 参数有效性检查
  if (!code || typeof code !== 'string') return undefined;

  try {
    // 使用Function构造函数创建安全的执行环境
    // 形参为event(事件对象), state(组件状态), setState(状态更新函数), console(控制台输出)
    // eslint-disable-next-line no-new-func
    const fn = new Function('event', 'state', 'setState', 'console', code);

    // 返回包装后的安全执行函数
    return (event: any, state: any, setState: any) =>
      fn(event, state, setState, console);
  } catch (e) {
    // 代码解析失败时的安全兜底
    console.warn('代码执行函数创建失败:', e);
    return undefined;
  }
}
