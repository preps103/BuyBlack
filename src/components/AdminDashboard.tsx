"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  PackagePlus,
  RefreshCw,
  ShieldAlert,
  Store,
  XCircle,
} from "lucide-react";
import { apiRequest, money } from "../api";
import type {
  Business,
  DashboardData,
  Product,
  ProviderReadiness,
} from "../types";

const emptyProduct = {
  businessId: "",
  name: "",
  description: "",
  price: "",
  inventoryCount: "",
  imageUrl: "",
};

function ProviderCard({ provider }: { provider: ProviderReadiness }) {
  const ready = provider.configured && provider.webhooksConfigured;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold capitalize">
            {provider.provider === "stripe" ? "Stripe / cards" : "PayPal"}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">
            {provider.mode} mode
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            ready
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {ready ? "Ready" : "Setup needed"}
        </span>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <p className="flex items-center gap-2">
          {provider.configured ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-amber-600" />
          )}
          Checkout credentials
        </p>
        <p className="flex items-center gap-2">
          {provider.webhooksConfigured ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-amber-600" />
          )}
          Payment confirmation webhook
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard({
  onCatalogChanged,
}: {
  onCatalogChanged: () => Promise<void>;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [productForm, setProductForm] = useState(emptyProduct);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await apiRequest<DashboardData>("/api/marketplace/dashboard"));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Merchant data could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const verifiedBusinesses = useMemo(
    () => data?.businesses.filter((business) => business.status === "verified") || [],
    [data],
  );

  useEffect(() => {
    if (!productForm.businessId && verifiedBusinesses[0]) {
      setProductForm((current) => ({
        ...current,
        businessId: verifiedBusinesses[0].id,
      }));
    }
  }, [productForm.businessId, verifiedBusinesses]);

  const updateStatus = async (
    business: Business,
    status: "verified" | "rejected" | "pending",
  ) => {
    setWorking(business.id);
    setError("");
    setMessage("");
    try {
      await apiRequest<{ business: Business }>(
        `/api/marketplace/businesses/${business.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );
      setMessage(`${business.name} is now ${status}.`);
      await Promise.all([load(), onCatalogChanged()]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Business status could not be updated.",
      );
    } finally {
      setWorking("");
    }
  };

  const createProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking("product");
    setError("");
    setMessage("");
    try {
      const response = await apiRequest<{ product: Product }>(
        "/api/marketplace/products",
        {
          method: "POST",
          body: JSON.stringify({
            ...productForm,
            priceCents: Math.round(Number(productForm.price) * 100),
            inventoryCount:
              productForm.inventoryCount === ""
                ? null
                : Number(productForm.inventoryCount),
          }),
        },
      );
      setMessage(`${response.product.name} is now live in the marketplace.`);
      setProductForm((current) => ({
        ...emptyProduct,
        businessId: current.businessId,
      }));
      await Promise.all([load(), onCatalogChanged()]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Product could not be published.",
      );
    } finally {
      setWorking("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rust" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-rust" />
        <h2 className="mt-4 font-serif text-3xl font-bold">Merchant portal unavailable</h2>
        <p className="mt-3 text-gray-600">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-6 rounded-full bg-rust px-6 py-3 font-bold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rust">
            Live merchant operations
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold">Merchant Portal</h1>
          <p className="mt-2 text-gray-600">
            Manage verification, products, orders, and payment readiness.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </section>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${
            error
              ? "border-rust/20 bg-rust/5 text-rust-dark"
              : "border-green-200 bg-green-50 text-green-800"
          }`}
          role="status"
        >
          {error || message}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-rust" />
          <h2 className="font-serif text-2xl font-bold">Payment processors</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ProviderCard provider={data.payments.stripe} />
          <ProviderCard provider={data.payments.paypal} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-rust" />
          <h2 className="font-serif text-2xl font-bold">
            {data.canAdmin ? "Business applications" : "Your businesses"}
          </h2>
        </div>
        {data.businesses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            No business applications yet. Use “List Your Business” to get started.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.businesses.map((business) => (
              <article
                key={business.id}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold">{business.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {business.category} · {business.location}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      business.status === "verified"
                        ? "bg-green-50 text-green-700"
                        : business.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {business.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {business.description}
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>{business.ownerName}</p>
                  <p>{business.email}</p>
                  {business.websiteUrl && (
                    <a
                      href={business.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 font-bold text-rust"
                    >
                      Website <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {data.canAdmin && (
                  <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      disabled={working === business.id}
                      onClick={() => void updateStatus(business, "verified")}
                      className="flex-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      disabled={working === business.id}
                      onClick={() => void updateStatus(business, "rejected")}
                      className="flex-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={createProduct}
          className="rounded-2xl border border-gray-200 bg-white p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-rust" />
            <h2 className="font-serif text-2xl font-bold">Publish a product</h2>
          </div>
          {verifiedBusinesses.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              A business must be verified before its products can be published.
            </p>
          ) : (
            <div className="space-y-4">
              <select
                required
                value={productForm.businessId}
                onChange={(event) =>
                  setProductForm({ ...productForm, businessId: event.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              >
                {verifiedBusinesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
              <input
                required
                value={productForm.name}
                onChange={(event) =>
                  setProductForm({ ...productForm, name: event.target.value })
                }
                placeholder="Product name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
              <textarea
                required
                minLength={10}
                rows={4}
                value={productForm.description}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    description: event.target.value,
                  })
                }
                placeholder="Product description"
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  min="0.50"
                  step="0.01"
                  type="number"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm({ ...productForm, price: event.target.value })
                  }
                  placeholder="Price (USD)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3"
                />
                <input
                  min="0"
                  step="1"
                  type="number"
                  value={productForm.inventoryCount}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      inventoryCount: event.target.value,
                    })
                  }
                  placeholder="Inventory (optional)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </div>
              <input
                type="url"
                value={productForm.imageUrl}
                onChange={(event) =>
                  setProductForm({ ...productForm, imageUrl: event.target.value })
                }
                placeholder="HTTPS product image URL (optional)"
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
              <button
                type="submit"
                disabled={working === "product"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-3 font-bold text-white disabled:opacity-60"
              >
                {working === "product" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Publish product
              </button>
            </div>
          )}
        </form>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-serif text-2xl font-bold">Live products</h2>
          <div className="mt-5 space-y-3">
            {data.products.length === 0 ? (
              <p className="text-sm text-gray-500">No products published yet.</p>
            ) : (
              data.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-bold">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.inventoryCount === null
                        ? "Inventory not tracked"
                        : `${product.inventoryCount} available`}
                    </p>
                  </div>
                  <p className="font-black text-rust">
                    {money(product.priceCents, product.currency)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-serif text-2xl font-bold">Orders</h2>
        <div className="mt-5 overflow-x-auto">
          {data.orders.length === 0 ? (
            <p className="text-sm text-gray-500">No checkout activity yet.</p>
          ) : (
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Business</th>
                  <th className="pb-3">Processor</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="py-4 font-mono text-xs">{order.id}</td>
                    <td className="py-4">{order.businessName}</td>
                    <td className="py-4 capitalize">{order.provider}</td>
                    <td className="py-4 capitalize">{order.status}</td>
                    <td className="py-4 text-right font-bold">
                      {money(order.totalCents, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
