export const APP_NAME = 'Hollywood Cut';
export const APP_DESCRIPTION = '上传人像照片，与电影主角在片场合影，打造您的专属电影时刻';

export const APPKEY_APPLY_URL = 'https://bailian.console.aliyun.com/';

export const PIPELINE_STAGES = [
  { key: 'idle', label: '等待开始' },
  { key: 'uploading', label: '上传图片中' },
  { key: 'validating', label: '校验图片中' },
  { key: 'face_selecting', label: '人脸识别中' },
  { key: 'movie_params', label: '参数配置' },
  { key: 'prompt_editing', label: '编辑提示词' },
  { key: 'generating', label: '生成图像中' },
  { key: 'quality_checking', label: '检测画质中' },
  { key: 'completed', label: '生成完成' },
  { key: 'failed', label: '生成失败' },
  { key: 'cancelled', label: '已取消' },
];

export const DEFAULT_ASPECT_RATIO = '720*1280';
export const DEFAULT_DEPTH_OF_FIELD = 'shallow';
