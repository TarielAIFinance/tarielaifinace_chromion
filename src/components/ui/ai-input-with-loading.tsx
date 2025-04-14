"use client";

import { CornerRightUp } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { Loader } from "@/components/ui/thinkingLoader/loader";

interface AIInputWithLoadingProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onSubmit?: (value: string) => void | Promise<void>;
  className?: string;
  isLoading?: boolean;
}

export function AIInputWithLoading({
  id = "ai-input-with-loading",
  placeholder = "Ask me anything!",
  minHeight = 57,
  maxHeight = 200,
  onSubmit,
  className,
  isLoading = false,
}: AIInputWithLoadingProps) {
  const [inputValue, setInputValue] = useState("");
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    await onSubmit?.(inputValue);
    setInputValue("");
    adjustHeight(true);
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-start flex-col gap-2">
        <div className="relative max-w-xl w-full mx-auto">
          <Textarea
            id={id}
            placeholder={placeholder}
            className={cn(
              "max-w-xl bg-black/5 dark:bg-white/5 w-full rounded-3xl pl-6 pr-10 py-4",
              "placeholder:text-black/70 dark:placeholder:text-white/70",
              "border-none ring-black/30 dark:ring-white/30",
              "text-black dark:text-white resize-none text-wrap leading-[1.2]",
              `min-h-[${minHeight}px]`
            )}
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 rounded-xl py-1 px-1",
              isLoading ? "bg-none cursor-not-allowed" : "bg-black/5 dark:bg-white/5"
            )}
            type="button"
            disabled={isLoading}
          >
            <CornerRightUp
              className={cn(
                "w-4 h-4 transition-opacity dark:text-white",
                inputValue ? "opacity-100" : "opacity-30"
              )}
            />
          </button>
        </div>
        <div className="pl-4 h-4 text-xs mx-auto text-black/70 dark:text-white/70 flex items-center justify-center">
          {isLoading ? (
            <Loader variant="loading-dots" text="Thinking" size="sm" />
          ) : (
            "Ready to submit!"
          )}
        </div>
      </div>
    </div>
  );
}