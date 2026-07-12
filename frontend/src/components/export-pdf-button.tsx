"use client";

import * as React from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";
import { exportNodeToPdf } from "@/lib/pdf-export";

interface ExportPdfButtonProps {
  /** Ref to the DOM node whose current contents (tables, charts, cards) get captured. */
  targetRef: React.RefObject<HTMLElement | null>;
  filename: string;
  title?: string;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export function ExportPdfButton({
  targetRef,
  filename,
  title,
  label = "Export PDF",
  variant = "outline",
  size,
  className,
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    if (!targetRef.current) return;
    setIsExporting(true);
    try {
      await exportNodeToPdf(targetRef.current, { filename, title });
      toast.success("PDF exported");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleExport}
      disabled={isExporting}
      data-pdf-ignore="true"
    >
      {isExporting ? <Loader2 className="animate-spin" /> : <FileDown />}
      {label}
    </Button>
  );
}
