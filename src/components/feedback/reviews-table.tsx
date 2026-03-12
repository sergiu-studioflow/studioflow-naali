"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { SOURCE_TYPE_OPTIONS } from "@/lib/feedback/column-mappings";
import type { CustomerReview } from "@/lib/types";

const PRODUCT_OPTIONS = [
  { value: "Anti-Stress Gummies", label: "Anti-Stress Gummies" },
  { value: "Magnesium+", label: "Magnesium+" },
  { value: "Menopause", label: "Menopause" },
  { value: "Multiple/Unknown", label: "Multiple / Unknown" },
];

function truncate(text: string | null, max = 80) {
  if (!text) return "-";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function ReviewsTable() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [sourceType, setSourceType] = useState("");
  const [productContext, setProductContext] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Detail dialog
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "50");
      if (sourceType) params.set("sourceType", sourceType);
      if (productContext) params.set("productContext", productContext);
      if (search) params.set("search", search);

      const res = await fetch(`/api/feedback/reviews?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, sourceType, productContext, search]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  async function openDetail(id: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/feedback/reviews/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedReview(data);
      }
    } catch {
      // silent
    } finally {
      setDetailLoading(false);
    }
  }

  const sourceLabel = (type: string) =>
    SOURCE_TYPE_OPTIONS.find((o) => o.value === type)?.label || type;

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-end gap-3">
            <div className="min-w-[160px]">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Source
              </label>
              <Select value={sourceType} onValueChange={(v) => { setSourceType(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {SOURCE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[160px]">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Product
              </label>
              <Select value={productContext} onValueChange={(v) => { setProductContext(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {PRODUCT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 items-end gap-2">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Search
                </label>
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search reviews..."
                  className="h-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleSearch} className="h-9 gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Search
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-4 text-sm text-muted-foreground">
            {total.toLocaleString()} reviews found
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No reviews found. Import some CSV data first.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-3 font-medium">Date</th>
                    <th className="pb-3 pr-3 font-medium">Source</th>
                    <th className="pb-3 pr-3 font-medium">Product</th>
                    <th className="pb-3 pr-3 font-medium">Main Problem</th>
                    <th className="pb-3 pr-3 font-medium">Key Quote</th>
                    <th className="pb-3 font-medium">Convinced By</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr
                      key={review.id}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0"
                      onClick={() => openDetail(review.id)}
                    >
                      <td className="py-3 pr-3 text-muted-foreground whitespace-nowrap">
                        {review.submittedAt
                          ? new Date(review.submittedAt).toLocaleDateString()
                          : new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs">
                          {review.sourceType.replace("_survey", "").toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        {review.productContext || "-"}
                      </td>
                      <td className="py-3 pr-3 max-w-[200px]">
                        {truncate(review.mainProblem)}
                      </td>
                      <td className="py-3 pr-3 max-w-[250px]">
                        {truncate(review.reviewText || review.whyPurchased)}
                      </td>
                      <td className="py-3 max-w-[200px]">
                        {truncate(review.whatConvinced)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Detail</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : selectedReview ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {sourceLabel(selectedReview.sourceType)}
                </span>
                {selectedReview.productContext && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {selectedReview.productContext}
                  </span>
                )}
              </div>

              {selectedReview.customerName && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Customer</p>
                  <p className="text-sm">
                    {selectedReview.customerName}
                    {selectedReview.ordersCount && (
                      <span className="ml-2 text-muted-foreground">
                        ({selectedReview.ordersCount} orders
                        {selectedReview.totalSpent && ` / ${selectedReview.totalSpent}`})
                      </span>
                    )}
                  </p>
                </div>
              )}

              {[
                { label: "Main Problem", value: selectedReview.mainProblem },
                { label: "Problem Description", value: selectedReview.problemDescription },
                { label: "Daily Impact", value: selectedReview.dailyImpact },
                { label: "Mood Words", value: selectedReview.moodWords },
                { label: "Review / Testimonial", value: selectedReview.reviewText },
                { label: "Why Purchased", value: selectedReview.whyPurchased },
                { label: "What Convinced Them", value: selectedReview.whatConvinced },
                { label: "Expected Outcome", value: selectedReview.expectedOutcome },
                { label: "Purchase Hesitations", value: selectedReview.purchaseHesitations },
                { label: "Discovery Source", value: selectedReview.discoverySource },
                { label: "Influencer", value: selectedReview.influencerSource },
              ]
                .filter((f) => f.value)
                .map((field) => (
                  <div key={field.label}>
                    <p className="text-xs font-medium text-muted-foreground">{field.label}</p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm">{field.value}</p>
                  </div>
                ))}

              {selectedReview.symptoms && Array.isArray(selectedReview.symptoms) && selectedReview.symptoms.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Symptoms</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedReview.symptoms.map((s, i) => (
                      <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
