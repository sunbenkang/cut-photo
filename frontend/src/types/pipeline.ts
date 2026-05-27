export type PipelineStage =
  | 'idle'
  | 'uploading'
  | 'validating'
  | 'face_selecting'
  | 'movie_params'
  | 'prompt_editing'
  | 'generating'
  | 'quality_checking'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type PipelineStep = 1 | 2 | 3 | 4 | 5 | 6;

export const PIPELINE_STEP_LABELS: Record<PipelineStep, string> = {
  1: '上传照片',
  2: '选择人脸',
  3: '电影 & 参数',
  4: '编辑提示词',
  5: '生成中',
  6: '完成',
};
