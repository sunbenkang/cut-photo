'use client';

import { ShuffleIcon, SkipForwardIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CharacterInfo } from '@/types/models';
import { cn } from '@/lib/utils';

interface Props {
  characters: CharacterInfo[];
  selectedCharacter: string | null;
  skipCharacter: boolean;
  onSelectCharacter: (name: string | null) => void;
  onSkip: () => void;
}

export default function CharacterPicker({
  characters,
  selectedCharacter,
  onSelectCharacter,
  onSkip,
}: Props) {
  const handleRandom = () => {
    if (characters.length === 0) return;
    const idx = Math.floor(Math.random() * characters.length);
    onSelectCharacter(characters[idx].character_name || characters[idx].actor_name);
  };

  if (characters.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-hollywood-blue">选择角色</label>
        <div className="p-3 border border-gray-300 bg-gray-50 text-sm text-gray-600">
          暂无角色信息，请跳过或使用手动提示词
        </div>
        <Button onClick={onSkip} variant="hollywood-outline" size="sm" className="text-xs">
          <SkipForwardIcon className="h-3 w-3 mr-1" />
          跳过角色匹配
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-hollywood-blue">选择角色</label>
        <div className="flex gap-2">
          <Button
            onClick={handleRandom}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-600 hover:text-hollywood-orange h-7"
          >
            <ShuffleIcon className="h-3 w-3 mr-1" />
            随机
          </Button>
          <Button onClick={onSkip} variant="ghost" size="sm" className="text-xs text-gray-600 h-7">
            <SkipForwardIcon className="h-3 w-3 mr-1" />
            跳过
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {characters.map((ch, i) => {
          const name = ch.character_name || ch.actor_name;
          const isSelected = selectedCharacter === name;
          return (
            <button
              key={i}
              onClick={() => onSelectCharacter(name)}
              className={cn(
                'hollywood-option text-left p-2 flex items-center gap-1.5',
                isSelected && 'hollywood-option-active'
              )}
            >
              {ch.profile_path ? (
                <img src={ch.profile_path} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
              ) : (
                <UserIcon className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate text-xs">{name}</span>
            </button>
          );
        })}
      </div>

      {selectedCharacter && (
        <p className="text-xs text-hollywood-orange">已选择：{selectedCharacter}</p>
      )}
    </div>
  );
}
