"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Loader2, Pencil, ChevronRight } from "lucide-react";
import { ProductDialog } from "./product-dialog";
import type { Product } from "@/lib/types";

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleSave = async (data: Partial<Product>) => {
    if (selectedProduct) {
      // Update
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update product");
      }
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } else {
      // Create
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create product");
      }
      const created = await res.json();
      setProducts((prev) => [...prev, created]);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete product");
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      <Card>
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 cursor-pointer select-none"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-3">
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${collapsed ? "" : "rotate-90"}`} />
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 dark:bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Products</CardTitle>
            {collapsed && products.length > 0 && (
              <span className="text-xs text-muted-foreground">{products.length} products</span>
            )}
          </div>
          {!collapsed && (
            <Button size="sm" onClick={(e) => { e.stopPropagation(); openCreate(); }}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Product
            </Button>
          )}
        </CardHeader>

        {!collapsed && (
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Package className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No products defined yet.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Create First Product
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        #
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Name
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Description
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => openEdit(product)}
                      >
                        <td className="px-5 py-5 text-muted-foreground tabular-nums">
                          {product.sortOrder}
                        </td>
                        <td className="px-5 py-5 font-medium text-foreground">
                          {product.name}
                        </td>
                        <td className="px-5 py-5 text-muted-foreground hidden md:table-cell">
                          {product.description
                            ? product.description.length > 60
                              ? product.description.slice(0, 60) + "..."
                              : product.description
                            : "\u2014"}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Pencil className="inline h-3.5 w-3.5 text-muted-foreground" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <ProductDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
