'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import type { ModelOption } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ExternalLinkIcon,
  Loader2Icon,
  CheckCircleIcon,
  CpuIcon,
  ChevronDownIcon,
} from 'lucide-react';
import { APPKEY_APPLY_URL } from '@/lib/constants';
import { toast } from 'sonner';
import HollywoodLogo from '@/components/layout/hollywood-logo';
import { cn } from '@/lib/utils';

function CornerStar({ className }: { className?: string }) {
  return (
    <span className={cn('absolute text-hollywood-orange text-lg select-none', className)}>
      ★
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, fetchModels, isAuthenticated, isLoading: authLoading, selectedModel } = useAuthStore();
  const [appKey, setAppKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'model' | 'login'>('input');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [chosenModel, setChosenModel] = useState(selectedModel || 'qwen-image-2.0');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleValidate = async () => {
    setError('');
    const trimmed = appKey.trim();
    if (!trimmed) {
      setError('请输入 AppKey');
      return;
    }
    if (!trimmed.startsWith('sk-')) {
      setError('AppKey 格式不正确，应为 sk- 开头');
      return;
    }

    setLoading(true);
    try {
      const modelList = await fetchModels(trimmed);
      setModels(modelList);
      setChosenModel(selectedModel || 'qwen-image-2.0');
      setStep('model');
      toast.success('AppKey 验证通过');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '验证失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login(appKey.trim(), chosenModel);
      toast.success('登录成功');
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败';
      setError(msg);
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('input');
    setError('');
  };

  const selectedModelName = models.find((m) => m.id === chosenModel)?.name || chosenModel;

  if (authLoading) return null;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-hollywood-cream">
      <div className="hollywood-card w-full max-w-md p-8 md:p-10">
        <CornerStar className="top-3 left-3" />
        <CornerStar className="top-3 right-3" />
        <CornerStar className="bottom-3 left-3" />
        <CornerStar className="bottom-3 right-3" />

        <HollywoodLogo size="lg" tagline="好莱坞片场之旅" className="mb-8" />

        <div className="space-y-4">
          <Input
            type="password"
            placeholder="在此粘贴您的 AppKey (sk-...)"
            value={appKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setAppKey(e.target.value);
              if (step !== 'input') setStep('input');
            }}
            className={cn(
              'hollywood-input text-center font-mono placeholder:text-gray-400',
              step === 'model' && 'ring-2 ring-hollywood-blue/30'
            )}
            autoFocus
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && step === 'input' && !loading) {
                handleValidate();
              }
            }}
          />
          {step === 'model' && (
            <CheckCircleIcon className="mx-auto h-5 w-5 text-green-600" />
          )}

          {step === 'model' && models.length > 0 && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="text-xs font-medium text-hollywood-blue flex items-center gap-1.5">
                <CpuIcon className="h-3.5 w-3.5" />
                选择生图模型
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between p-2.5 border-2 border-hollywood-blue bg-hollywood-cream-input text-sm hover:bg-white transition-colors"
                >
                  <span className="truncate">{selectedModelName}</span>
                  <ChevronDownIcon
                    className={cn(
                      'h-4 w-4 shrink-0 ml-2 transition-transform',
                      showDropdown && 'rotate-180'
                    )}
                  />
                </button>
                {showDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-hollywood-blue shadow-[4px_4px_0_0_#003399] max-h-56 overflow-y-auto">
                    {models.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setChosenModel(m.id);
                          setShowDropdown(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm transition-colors',
                          m.id === chosenModel
                            ? 'bg-hollywood-orange/10 text-hollywood-blue font-medium'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{m.name}</span>
                          {m.id === chosenModel && (
                            <CheckCircleIcon className="h-3.5 w-3.5 text-hollywood-orange shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{m.id}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {showDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              )}
            </div>
          )}

          {error && (
            <div className="p-3 border-2 border-red-400 bg-red-50 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 'input' && (
            <Button
              onClick={handleValidate}
              disabled={loading || !appKey.trim()}
              className="w-full h-11 bg-hollywood-blue hover:bg-hollywood-blue-light text-white font-bold rounded-none border-2 border-hollywood-blue"
            >
              {loading ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  验证中...
                </>
              ) : (
                '进入电影片场 >'
              )}
            </Button>
          )}

          {step === 'model' && (
            <div className="flex gap-3">
              <Button
                onClick={handleBack}
                disabled={loading}
                variant="outline"
                className="flex-1 border-2 border-hollywood-blue text-hollywood-blue rounded-none"
              >
                返回修改
              </Button>
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 h-11 bg-hollywood-blue hover:bg-hollywood-blue-light text-white font-bold rounded-none"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '进入电影片场 >'
                )}
              </Button>
            </div>
          )}

          <p className="text-center pt-2">
            <a
              href={APPKEY_APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-hollywood-blue underline decoration-dotted underline-offset-4 hover:text-hollywood-orange inline-flex items-center gap-1"
            >
              获取 AppKey
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
