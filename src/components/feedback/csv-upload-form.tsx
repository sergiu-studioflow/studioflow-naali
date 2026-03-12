"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import Papa from "papaparse";
import { mapCsvRow, detectSourceType, SOURCE_TYPE_OPTIONS } from "@/lib/feedback/column-mappings";
import type { SourceType } from "@/lib/feedback/column-mappings";
import type { CsvImport } from "@/lib/types";

const BATCH_SIZE = 500;

export function CsvUploadForm() {
  const [sourceType, setSourceType] = useState<SourceType | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imports, setImports] = useState<CsvImport[]>([]);
  const [loadingImports, setLoadingImports] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImports();
  }, []);

  async function fetchImports() {
    try {
      const res = await fetch("/api/feedback/imports");
      if (res.ok) {
        const data = await res.json();
        setImports(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingImports(false);
    }
  }

  async function handleUpload() {
    if (!file || !sourceType) {
      setError("Please select a file and source type");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse CSV client-side
      const text = await file.text();
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim(),
      });

      if (result.errors.length > 0 && result.data.length === 0) {
        throw new Error(`CSV parse error: ${result.errors[0].message}`);
      }

      const rows = result.data as Record<string, string>[];
      const totalRows = rows.length;
      setProgress({ current: 0, total: totalRows });

      // Map rows using column mappings
      const mappedRows = rows
        .map((row) => {
          try {
            return mapCsvRow(row, sourceType as SourceType);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      if (mappedRows.length === 0) {
        throw new Error("No valid rows found after mapping");
      }

      // Upload in batches
      let importId: string | null = null;
      let totalInserted = 0;

      for (let i = 0; i < mappedRows.length; i += BATCH_SIZE) {
        const batch = mappedRows.slice(i, i + BATCH_SIZE);

        const importRes: Response = await fetch("/api/feedback/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            sourceType,
            rows: batch,
            importId: importId as string | undefined,
          }),
        });

        if (!importRes.ok) {
          const errData = await importRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to import batch");
        }

        const resData = await importRes.json();
        importId = resData.importId;
        totalInserted += resData.rowsInserted;
        setProgress({ current: totalInserted, total: mappedRows.length });
      }

      // Finalize import
      if (importId) {
        await fetch("/api/feedback/imports", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            importId,
            status: "complete",
            rowCount: totalInserted,
          }),
        });
      }

      setSuccess(`Successfully imported ${totalInserted} reviews from ${file.name}`);
      setFile(null);
      setSourceType("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchImports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setUploading(false);
    }
  }

  const sourceLabel = (type: string) =>
    SOURCE_TYPE_OPTIONS.find((o) => o.value === type)?.label || type;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with customer reviews or survey responses. The
              source type is auto-detected from the column headers.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                CSV File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  setFile(selected);
                  setSourceType("");
                  setError(null);
                  if (selected) {
                    // Read first line to auto-detect source type
                    const reader = new FileReader();
                    reader.onload = () => {
                      const firstLine = (reader.result as string).split("\n")[0];
                      const headers = firstLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
                      const detected = detectSourceType(headers);
                      if (detected) {
                        setSourceType(detected);
                      } else {
                        setError("Could not auto-detect survey type. Please select manually.");
                      }
                    };
                    reader.readAsText(selected.slice(0, 4096));
                  }
                }}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            {file && sourceType && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm dark:border-emerald-900 dark:bg-emerald-950">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">
                  Detected: <strong>{SOURCE_TYPE_OPTIONS.find((o) => o.value === sourceType)?.label}</strong>
                </span>
              </div>
            )}

            {file && !sourceType && !error && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Could not auto-detect — select manually
                </label>
                <Select
                  value={sourceType}
                  onValueChange={(v) => { setSourceType(v as SourceType); setError(null); }}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select survey type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {uploading && progress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Importing...</span>
                  <span>
                    {progress.current.toLocaleString()} /{" "}
                    {progress.total.toLocaleString()} rows
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.round((progress.current / progress.total) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleUpload}
                disabled={uploading || !file || !sourceType}
                className="gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload & Import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Import History
          </h3>
          {loadingImports ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : imports.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No imports yet. Upload your first CSV above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">File</th>
                    <th className="pb-3 pr-4 font-medium">Source</th>
                    <th className="pb-3 pr-4 font-medium">Rows</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {imports.map((imp) => (
                    <tr key={imp.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="max-w-[200px] truncate">
                            {imp.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">{sourceLabel(imp.sourceType)}</td>
                      <td className="py-3 pr-4">
                        {imp.rowCount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            imp.status === "complete"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : imp.status === "error"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {imp.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(imp.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
