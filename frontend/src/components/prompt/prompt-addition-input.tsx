'use client';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function PromptAdditionInput({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-hollywood-blue">追加提示词（可选）</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例如：手持咖啡杯、穿着红色外套"
        className="hollywood-input"
      />
    </div>
  );
}
