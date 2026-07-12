"use client";

import * as React from "react";
import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";

import { getErrorMessage } from "@/lib/api-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateVehicleDocument,
  useDeleteVehicleDocument,
  useVehicleDocuments,
} from "@/features/vehicle-documents/hooks";

const COMMON_DOC_TYPES = ["Insurance", "Registration", "Permit", "Fitness Certificate", "Other"];
const EXPIRY_WARNING_DAYS = 30;

function expiryBadge(expiryDate: string | null) {
  if (!expiryDate) {
    return <span className="text-sm text-muted-foreground">No expiry</span>;
  }
  const daysRemaining = Math.ceil(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const label = new Date(expiryDate).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  if (daysRemaining < 0) {
    return (
      <Badge className="border-transparent bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400">
        Expired {label}
      </Badge>
    );
  }
  if (daysRemaining <= EXPIRY_WARNING_DAYS) {
    return (
      <Badge className="border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
        Expires {label}
      </Badge>
    );
  }
  return <span className="text-sm text-muted-foreground">Expires {label}</span>;
}

export function VehicleDocumentsPanel({ vehicleId }: { vehicleId: number }) {
  const { data: documents, isLoading, isError, error } = useVehicleDocuments(vehicleId);
  const createDocument = useCreateVehicleDocument();
  const deleteDocument = useDeleteVehicleDocument();

  const [docType, setDocType] = React.useState(COMMON_DOC_TYPES[0]);
  const [fileUrl, setFileUrl] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fileUrl.trim()) return;
    await createDocument.mutateAsync({
      vehicle_id: vehicleId,
      doc_type: docType,
      file_url: fileUrl.trim(),
      expiry_date: expiryDate || null,
    });
    setFileUrl("");
    setExpiryDate("");
  };

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load documents</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : documents && documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{doc.doc_type}</span>
                  {expiryBadge(doc.expiry_date)}
                </div>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 truncate text-sm text-primary hover:underline"
                >
                  {doc.file_url}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={deleteDocument.isPending}
                onClick={() => deleteDocument.mutate(doc.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">Delete document</span>
              </Button>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No documents added yet.
          </p>
        )}
      </div>

      <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-[140px_1fr_160px_auto] sm:items-start">
        <Select value={docType} onValueChange={setDocType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMON_DOC_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Document URL"
          value={fileUrl}
          onChange={(event) => setFileUrl(event.target.value)}
        />
        <Input
          type="date"
          value={expiryDate}
          onChange={(event) => setExpiryDate(event.target.value)}
          placeholder="Expiry (optional)"
        />
        <Button type="submit" disabled={createDocument.isPending || !fileUrl.trim()}>
          {createDocument.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
          Add
        </Button>
      </form>
    </div>
  );
}
