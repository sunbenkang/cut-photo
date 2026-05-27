'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePipelineStore } from '@/stores/pipeline-store';
import { useSSE } from '@/hooks/use-sse';
import { getSSEUrl, startGenerationApi, cancelGenerationApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { assemblePromptLocal } from '@/lib/prompt-utils';
import { FileTextIcon } from 'lucide-react';

import StepIndicator from '@/components/pipeline/step-indicator';
import UploadZone from '@/components/upload/upload-zone';
import ValidationStatus from '@/components/upload/validation-status';
import FaceCanvas from '@/components/face-select/face-canvas';
import MovieSearchInput from '@/components/movie/movie-search-input';
import CharacterPicker from '@/components/movie/character-picker';
import AspectRatioSelector from '@/components/params/aspect-ratio-selector';
import DepthOfFieldSelector from '@/components/params/depth-of-field-selector';
import TemplateSelector from '@/components/params/template-selector';
import PromptAdditionInput from '@/components/prompt/prompt-addition-input';
import PromptPreview from '@/components/prompt/prompt-preview';
import PreviewPanel from '@/components/pipeline/preview-panel';
import ResultDisplay from '@/components/pipeline/result-display';
import HollywoodLogo from '@/components/layout/hollywood-logo';
import SectionHeader from '@/components/layout/section-header';
import { Button } from '@/components/ui/button';

export default function GenerationPage() {
  const store = usePipelineStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isCancelling, setCancelling] = useState(false);
  const [assembledPrompt, setAssembledPrompt] = useState('');
  const [promptMultiplier, setPromptMultiplier] = useState<1 | 2>(1);

  useEffect(() => {
    if (store.step >= 3) {
      const prompt = assemblePromptLocal(
        store.aspectRatio,
        store.depthOfField,
        store.selectedTemplate?.prompt_template || '',
        store.selectedCharacter || '',
        store.userPrompt
      );
      setAssembledPrompt(prompt);
    }
  }, [
    store.step,
    store.aspectRatio,
    store.depthOfField,
    store.selectedTemplate,
    store.selectedCharacter,
    store.userPrompt,
  ]);

  const sseUrl = store.taskId && store.step === 5 ? getSSEUrl(store.taskId) : null;

  useSSE(
    sseUrl,
    {
      onStage: (data) => {
        store.setStatus(data.message as string, (data.progress as number) || store.statusProgress);
      },
      onRetry: (data) => {
        store.setRetryCount((data.attempt as number) || store.retryCount + 1);
        store.setStatus(data.message as string, store.statusProgress);
        toast.info(data.message as string);
      },
      onComplete: (data) => {
        store.setResultImage({
          url: data.image_url as string,
          width: data.width as number,
          height: data.height as number,
        });
        toast.success('合影生成完成！');
      },
      onError: (data) => {
        store.setError(data.message as string);
        toast.error((data.message as string) || '生成失败');
      },
      onCancelled: () => {
        store.setStep(1);
        store.setStatus('已取消', 0);
        toast.info('已终止生成');
      },
    },
    store.step === 5
  );

  const handleUpload = useCallback(
    (data: Parameters<typeof store.setUploadedImage>[0]) => {
      store.setUploadedImage(data);
    },
    [store]
  );

  const handleGeneratePrompt = () => {
    const prompt = assemblePromptLocal(
      store.aspectRatio,
      store.depthOfField,
      store.selectedTemplate?.prompt_template || '',
      store.selectedCharacter || '',
      store.userPrompt
    );
    setAssembledPrompt(prompt);
    if (store.step < 4) store.setStep(4);
    toast.success('导演指令已生成');
  };

  const handleGenerate = async () => {
    store.setStep(5);
    store.setStatus('正在启动生成...', 5);
    try {
      const res = await startGenerationApi({
        upload_id: store.uploadedImage?.upload_id,
        face_index: store.selectedFaceIndex,
        movie_id: store.selectedMovie?.id || null,
        character_name: store.selectedCharacter || null,
        aspect_ratio: store.aspectRatio,
        depth_of_field: store.depthOfField,
        template_id: store.selectedTemplate?.id || null,
        user_prompt: store.userPrompt,
        skip_character: store.skipCharacter,
      });
      store.setTaskId(res.task_id);
    } catch (err: unknown) {
      const msg = (err as Error).message || '启动生成失败';
      store.setError(msg);
      toast.error(msg);
      store.setStep(4);
    }
  };

  const handleCancel = async () => {
    if (!store.taskId) return;
    setCancelling(true);
    try {
      await cancelGenerationApi(store.taskId);
    } catch {
      /* force cancel on frontend */
    }
    setCancelling(false);
    store.setStep(4);
    store.setStatus('', 0);
  };

  const handleReEdit = () => {
    store.setStep(3);
    store.setTaskId(null);
    store.setResultImage(null);
    store.setError(null);
    store.setStatus('', 0);
  };

  const handleRegenerate = () => {
    store.setStep(4);
    store.setTaskId(null);
    store.setResultImage(null);
    store.setError(null);
    store.setStatus('', 0);
  };

  const canAction =
    store.uploadedImage &&
    store.step >= 4 &&
    assembledPrompt.trim().length > 0 &&
    store.step !== 5;

  const previewUrl =
    store.resultImage?.url ||
    (store.uploadedImage?.preview_url && store.step < 6
      ? store.uploadedImage.preview_url
      : null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      <HollywoodLogo size="md" className="mb-6" />
      <StepIndicator currentStep={store.step} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-6 lg:gap-8 mt-4">
        {/* Left column */}
        <div className="space-y-5">
          {/* Upload */}
          <section>
            <SectionHeader title="上传素材" subtitle="UPLOAD" icon="dot" />
            <UploadZone
              onUpload={handleUpload}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
            {store.uploadedImage?.layers && store.uploadedImage.layers.length > 0 && store.step <= 3 && (
              <div className="mt-3">
                <ValidationStatus
                  layers={store.uploadedImage.layers}
                  isValid={store.uploadedImage.valid}
                />
              </div>
            )}
          </section>

          {/* Face select */}
          {store.step >= 2 && store.uploadedImage && store.uploadedImage.faces.length > 0 && store.step < 5 && (
            <section className="hollywood-panel">
              <SectionHeader title="选择人脸" subtitle="CAST" icon="diamond" />
              <FaceCanvas
                imageUrl={store.uploadedImage.preview_url}
                faces={store.uploadedImage.faces}
                imageWidth={store.uploadedImage.original_width}
                imageHeight={store.uploadedImage.original_height}
                selectedIndex={store.selectedFaceIndex}
                onSelect={store.selectFace}
              />
              {store.step === 2 && (
                <Button
                  onClick={() => store.setStep(3)}
                  variant="hollywood"
                  className="w-full mt-3"
                >
                  确认人选，继续场景设定
                </Button>
              )}
            </section>
          )}

          {/* Scene */}
          {store.step >= 3 && store.step < 5 && (
            <section className="hollywood-panel space-y-4">
              <SectionHeader title="场景设定" subtitle="SCENE" icon="dot" />
              <MovieSearchInput
                onSelectMovie={(movie) => store.setSelectedMovie(movie)}
                selectedMovie={store.selectedMovie}
              />
              {store.selectedMovie &&
                store.selectedMovie.characters &&
                store.selectedMovie.characters.length > 0 && (
                  <CharacterPicker
                    characters={store.selectedMovie.characters}
                    selectedCharacter={store.selectedCharacter}
                    skipCharacter={store.skipCharacter}
                    onSelectCharacter={store.setSelectedCharacter}
                    onSkip={() => store.setSkipCharacter(true)}
                  />
                )}
              <AspectRatioSelector value={store.aspectRatio} onChange={store.setAspectRatio} />
              <DepthOfFieldSelector value={store.depthOfField} onChange={store.setDepthOfField} />
              <TemplateSelector
                selected={store.selectedTemplate}
                onSelect={store.setSelectedTemplate}
              />
              <PromptAdditionInput value={store.userPrompt} onChange={store.setUserPrompt} />
            </section>
          )}

          {/* Director */}
          {store.step >= 3 && store.step < 5 && (
            <section className="hollywood-panel space-y-3">
              <SectionHeader title="导演指令" subtitle="DIRECTOR" icon="diamond" />
              <Button
                onClick={handleGeneratePrompt}
                variant="hollywood"
                size="sm"
                className="w-full sm:w-auto"
              >
                <FileTextIcon className="h-4 w-4 mr-1.5" />
                生成指令
              </Button>
              <PromptPreview prompt={assembledPrompt} onChange={setAssembledPrompt} />
              <div className="flex justify-end gap-1">
                {([1, 2] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPromptMultiplier(m)}
                    className={`px-2 py-0.5 text-xs border ${
                      promptMultiplier === m
                        ? 'hollywood-option-active'
                        : 'hollywood-option'
                    }`}
                  >
                    x{m}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Error */}
          {store.error && store.step === 5 && (
            <div className="p-3 border-2 border-red-400 bg-red-50 text-sm text-red-700">
              {store.error}
              <Button
                onClick={() => {
                  store.setStep(4);
                  store.setError(null);
                }}
                variant="hollywood-outline"
                size="sm"
                className="mt-2"
              >
                返回修改
              </Button>
            </div>
          )}

          {/* ACTION bar */}
          {canAction && (
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-4 bg-hollywood-orange text-white font-heading text-2xl font-bold italic tracking-wider hover:bg-hollywood-orange/90 transition-colors border-2 border-hollywood-orange shadow-[4px_4px_0_0_#003399]"
            >
              ACTION!
            </button>
          )}
        </div>

        {/* Right column - preview */}
        <div className="space-y-4">
          <PreviewPanel
            imageUrl={store.step === 6 ? store.resultImage?.url : null}
            imageWidth={store.resultImage?.width}
            imageHeight={store.resultImage?.height}
            isGenerating={store.step === 5}
            statusMessage={store.statusMessage}
            progress={store.statusProgress}
            isCancelling={isCancelling}
            onCancel={store.step === 5 ? handleCancel : undefined}
            previewUrl={store.step < 6 && store.step !== 5 ? previewUrl : null}
          />

          {store.step === 6 && store.resultImage && (
            <ResultDisplay
              imageUrl={store.resultImage.url}
              width={store.resultImage.width}
              height={store.resultImage.height}
              retryCount={store.retryCount}
              onReEdit={handleReEdit}
              onRegenerate={handleRegenerate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
