export function safeEvalFunction(
  code: string | undefined
): ((...args: any[]) => any) | undefined {
  if (!code || typeof code !== 'string') return undefined;
  try {
    // 仅创建函数体，形参为 event, state, setState, console
    // eslint-disable-next-line no-new-func
    const fn = new Function('event', 'state', 'setState', 'console', code);
    return (event: any, state: any, setState: any) =>
      fn(event, state, setState, console);
  } catch (e) {
    // 安全失败兜底
    return undefined;
  }
} 