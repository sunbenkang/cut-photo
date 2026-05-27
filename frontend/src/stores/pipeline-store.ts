import { create } from 'zustand';
import type { FaceBox, UploadResponse, MovieDetail, TemplateInfo } from '@/types/models';
import type { PipelineStep } from '@/types/pipeline';

interface PipelineState {
  step: PipelineStep;
  stage: string;
  uploadedImage: UploadResponse | null;
  selectedFaceIndex: number;

  // Movie & params
  selectedMovie: MovieDetail | null;
  selectedCharacter: string | null;
  skipCharacter: boolean;
  aspectRatio: string;
  depthOfField: string;
  selectedTemplate: TemplateInfo | null;
  userPrompt: string;

  // Generation
  taskId: string | null;
  statusMessage: string;
  statusProgress: number;
  retryCount: number;
  resultImage: { url: string; width: number; height: number } | null;
  error: string | null;

  // Actions
  setStep: (step: PipelineStep) => void;
  setUploadedImage: (data: UploadResponse) => void;
  setFaces: (faces: FaceBox[]) => void;
  selectFace: (index: number) => void;
  setSelectedMovie: (movie: MovieDetail | null) => void;
  setSelectedCharacter: (name: string | null) => void;
  setSkipCharacter: (skip: boolean) => void;
  setAspectRatio: (v: string) => void;
  setDepthOfField: (v: string) => void;
  setSelectedTemplate: (t: TemplateInfo | null) => void;
  setUserPrompt: (p: string) => void;
  setTaskId: (id: string | null) => void;
  setStatus: (msg: string, progress: number) => void;
  setRetryCount: (n: number) => void;
  setResultImage: (img: { url: string; width: number; height: number } | null) => void;
  setError: (e: string | null) => void;
  reset: () => void;
  loadFromWork: (params: {
    movie?: MovieDetail | null;
    character?: string | null;
    aspectRatio?: string;
    depthOfField?: string;
    template?: TemplateInfo | null;
    userPrompt?: string;
  }) => void;
}

const initialState = {
  step: 1 as PipelineStep,
  stage: 'idle',
  uploadedImage: null,
  selectedFaceIndex: 0,
  selectedMovie: null,
  selectedCharacter: null,
  skipCharacter: false,
  aspectRatio: '720*1280',
  depthOfField: 'shallow',
  selectedTemplate: null,
  userPrompt: '',
  taskId: null,
  statusMessage: '',
  statusProgress: 0,
  retryCount: 0,
  resultImage: null,
  error: null,
};

export const usePipelineStore = create<PipelineState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setUploadedImage: (data) => set({
    uploadedImage: data,
    step: data.faces.length > 0 ? 2 : 3, // Skip face select if no faces detected
  }),

  setFaces: () => {}, // Faces come from upload response

  selectFace: (index) => set({ selectedFaceIndex: index }),

  setSelectedMovie: (movie) => set({ selectedMovie: movie, selectedCharacter: null }),

  setSelectedCharacter: (name) => set({ selectedCharacter: name, skipCharacter: false }),

  setSkipCharacter: (skip) => set({ skipCharacter: skip, selectedCharacter: skip ? null : undefined }),

  setAspectRatio: (v) => set({ aspectRatio: v }),

  setDepthOfField: (v) => set({ depthOfField: v }),

  setSelectedTemplate: (t) => set((state) => {
    if (!t) {
      // Deselect template
      return { selectedTemplate: null };
    }
    // Template overrides params
    return {
      selectedTemplate: t,
      aspectRatio: t.aspect_ratio || state.aspectRatio,
      depthOfField: t.depth_of_field || state.depthOfField,
    };
  }),

  setUserPrompt: (p) => set({ userPrompt: p }),

  setTaskId: (id) => set({ taskId: id }),

  setStatus: (msg, progress) => set({ statusMessage: msg, statusProgress: progress }),

  setRetryCount: (n) => set({ retryCount: n }),

  setResultImage: (img) => set({ resultImage: img, step: 6, stage: 'completed' }),

  setError: (e) => set({ error: e, stage: e ? 'failed' : 'idle' }),

  reset: () => set({ ...initialState, step: 1 }),

  loadFromWork: (params) => set({
    selectedMovie: params.movie ?? null,
    selectedCharacter: params.character ?? null,
    aspectRatio: params.aspectRatio ?? '720*1280',
    depthOfField: params.depthOfField ?? 'shallow',
    selectedTemplate: params.template ?? null,
    userPrompt: params.userPrompt ?? '',
    step: 3,
    stage: 'movie_params',
    resultImage: null,
    error: null,
    taskId: null,
  }),
}));
