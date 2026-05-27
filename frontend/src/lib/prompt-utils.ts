/**
 * Client-side prompt assembly (mirrors backend prompt_service.py).
 * Used for preview display before generation.
 */

function getAspectRatioDesc(value: string): string {
  const mapping: Record<string, string> = {
    '720*1280': '画面比例：9:16 竖屏构图',
    '1080*1440': '画面比例：3:4 人像构图',
    '1440*1080': '画面比例：4:3 横版构图',
    '1920*1080': '画面比例：16:9 宽屏构图',
  };
  return mapping[value] || '';
}

function getDepthFieldDesc(value: string): string {
  const mapping: Record<string, string> = {
    shallow: '浅景深，背景适当虚化，突出人物主体',
    standard: '标准景深，人物与背景保持自然清晰度',
    deep: '全景深，前后景均保持清晰，展现完整片场环境',
  };
  return mapping[value] || '标准景深';
}

const BASE_PROMPT = `你是一位专业的电影片场摄影师，请生成一张写实风格的照片。

核心要求：
- 抓拍风格：照片应呈现真实的幕后花絮感，仿佛剧组工作人员随手抓拍
- 片场实景：背景应为真实的电影拍摄现场，包含摄影器材、灯光设备、剧组人员等元素
- 光影统一：人物面部光影方向必须与环境光源一致，色调融合自然
- 透视合理：人物与场景的透视关系真实，仿佛人物真实站在场景中
- 画质要求：高清晰度，电影级色彩调校，自然肤色还原，皮肤质感真实
- 拒绝影楼风：杜绝过度磨皮、影楼打光、不自然的边缘融合

{aspect_desc}
景深效果：{depth_desc}`;

export function assemblePromptLocal(
  aspectRatio: string,
  depthOfField: string,
  templatePrompt: string,
  characterName: string,
  userAdditions: string,
): string {
  const base = BASE_PROMPT
    .replace('{aspect_desc}', getAspectRatioDesc(aspectRatio))
    .replace('{depth_desc}', getDepthFieldDesc(depthOfField));

  const parts = [base];

  if (templatePrompt) {
    const filled = templatePrompt.replace('{character}', characterName || '主角');
    parts.push(`\n场景描述：\n${filled}`);
  } else if (characterName) {
    parts.push(`\n场景描述：\n照片中与 ${characterName} 在片场合影`);
  }

  if (userAdditions.trim()) {
    parts.push(`\n补充要求：\n${userAdditions.trim()}`);
  }

  return parts.join('\n').trim();
}
