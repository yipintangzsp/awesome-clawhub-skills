/**
 * before_prompt_build Hook
 * 在发送给 LLM 前修改 prompt
 */

on("before_prompt_build", (event, ctx) => {
  // 注入实时时间
  const currentTime = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour12: false
  });
  
  return {
    prependContext: `🕐 当前时间：${currentTime} (Asia/Shanghai)\n\n`
  };
});
