'use client';

interface Props {
  prompt: string;
  onChange: (v: string) => void;
}

export default function PromptPreview({ prompt, onChange }: Props) {
  return (
    <div className="space-y-2">
      <textarea
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="输入电影名称后点击「生成指令」..."
        className="w-full p-3 border-2 border-hollywood-blue bg-white text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-hollywood-blue/30 font-mono leading-relaxed min-h-[160px]"
      />
      <p className="text-xs text-gray-500">
        提示词由系统自动生成，您可在此基础上自由编辑
      </p>
    </div>
  );
}
