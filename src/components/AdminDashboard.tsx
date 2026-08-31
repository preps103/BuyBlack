"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserRoundSearch,
  XCircle,
} from "lucide-react";
import { apiRequest } from "../api";
import type { Business, DashboardData } from "../types";

const relationshipLabels = {
  owner: "Owner or founder",
  team_member: "Team member",
  community_nomination: "Community nomination",
};

export default function AdminDashboard({
  onDirectoryChanged,
}: {
  onDirectoryChanged: () => Promise<void>;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [evidenceDetails, setEvidenceDetails] = useState<Record<string, string>>({});
  const [evidenceUrls, setEvidenceUrls] = useState<Record<string, string>>({});
  const [ownershipChecks, setOwnershipChecks] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await apiRequest<DashboardData>("/api/marketplace/dashboard");
      setData(next);
      setReviewNotes(
        Object.fromEntries(next.businesses.map((business) => [business.id, business.reviewNote || ""])),
      );
      setEvidenceDetails(
        Object.fromEntries(next.businesses.map((business) => [business.id, business.verificationDetails || ""])),
      );
      setEvidenceUrls(
        Object.fromEntries(next.businesses.map((business) => [business.id, business.verificationUrl || ""])),
      );
      setOwnershipChecks(
        Object.fromEntries(next.businesses.map((business) => [business.id, Boolean(business.ownershipConfirmed)])),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Submission data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (business: Business, status: "verified" | "rejected") => {
    const reviewNote = (reviewNotes[business.id] || "").trim();
    if (reviewNote.length < 10) {
      setError("Add a review note of at least 10 characters before making a decision.");
      return;
    }
    const verificationDetails = (evidenceDetails[business.id] || "").trim();
    if (status === "verified" && (!ownershipChecks[business.id] || verificationDetails.length < 30)) {
      setError("Confirm 51%+ Black ownership and record at least 30 characters of verification details before publishing.");
      return;
    }
    setWorking(business.id);
    setError("");
    setMessage("");
    try {
      await apiRequest<{ business: Business }>(
        `/api/marketplace/businesses/${business.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            reviewNote,
            ownershipConfirmed: ownershipChecks[business.id],
            verificationDetails,
            verificationUrl: evidenceUrls[business.id] || null,
          }),
        },
      );
      setMessage(`${business.name} is now ${status}.`);
      await Promise.all([load(), onDirectoryChanged()]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The curation decision could not be saved.");
    } finally {
      setWorking("");
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-rust" /></div>;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-rust" />
        <h2 className="mt-4 font-serif text-3xl font-bold">Submissions unavailable</h2>
        <p className="mt-3 text-gray-600">{error}</p>
        <button type="button" onClick={() => void load()} className="mt-6 rounded-full bg-rust px-6 py-3 font-bold text-white">Try again</button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rust">
            {data.canAdmin ? "Human-reviewed directory" : "Your submitted businesses"}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold">
            {data.canAdmin ? "Curation Center" : "Submission Status"}
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            {data.canAdmin
              ? "Review ownership evidence and publish only businesses that meet the BuyBlack standard."
              : "Track the verification status and curator notes for businesses you submitted."}
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Awaiting review", data.stats.pending, "text-amber-700 bg-amber-50"],
          ["Published", data.stats.verified, "text-green-700 bg-green-50"],
          ["Not approved", data.stats.rejected, "text-red-700 bg-red-50"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className={`rounded-2xl p-5 ${color}`}>
            <p className="font-serif text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm font-bold">{label}</p>
          </div>
        ))}
      </section>

      {(message || error) && (
        <div className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${error ? "border-rust/20 bg-rust/5 text-rust-dark" : "border-green-200 bg-green-50 text-green-800"}`} role="status">
          {error || message}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <UserRoundSearch className="h-5 w-5 text-rust" />
          <h2 className="font-serif text-2xl font-bold">Business submissions</h2>
        </div>
        {data.businesses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
            No business submissions yet.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {data.businesses.map((business) => (
              <article key={business.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold">{business.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{business.category} · {business.location}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${business.status === "verified" ? "bg-green-50 text-green-700" : business.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                    {business.status}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-gray-600">{business.description}</p>

                <dl className="mt-5 grid gap-3 rounded-2xl bg-[#FAF8F5] p-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs font-bold uppercase tracking-wider text-gray-400">Submitted by</dt><dd className="mt-1 font-semibold">{business.ownerName || "Not provided"}</dd></div>
                  <div><dt className="text-xs font-bold uppercase tracking-wider text-gray-400">Relationship</dt><dd className="mt-1 font-semibold">{relationshipLabels[business.submitterRelationship || "owner"]}</dd></div>
                  <div><dt className="text-xs font-bold uppercase tracking-wider text-gray-400">Ownership attested</dt><dd className="mt-1 flex items-center gap-1.5 font-semibold">{ownershipChecks[business.id] ? <><CheckCircle2 className="h-4 w-4 text-green-600" /> 51%+ Black-owned</> : <><XCircle className="h-4 w-4 text-red-600" /> Missing</>}</dd></div>
                  <div><dt className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact</dt><dd className="mt-1 break-all font-semibold">{business.email}</dd></div>
                </dl>

                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Verification details</p>
                    <p className="mt-1 leading-relaxed text-gray-600">{evidenceDetails[business.id] || "No details provided."}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {evidenceUrls[business.id] && <a href={evidenceUrls[business.id]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-rust">Ownership source <ExternalLink className="h-3.5 w-3.5" /></a>}
                    {business.websiteUrl && <a href={business.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-rust">Business website <ExternalLink className="h-3.5 w-3.5" /></a>}
                  </div>
                </div>

                {data.canAdmin ? (
                  <div className="mt-5 border-t border-gray-100 pt-5">
                    <div className="mb-4 rounded-2xl border border-gold-base/30 bg-gold-light/10 p-4">
                      <label className="flex items-start gap-3 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={Boolean(ownershipChecks[business.id])}
                          onChange={(event) => setOwnershipChecks((current) => ({ ...current, [business.id]: event.target.checked }))}
                          className="mt-1 h-4 w-4 accent-rust"
                        />
                        I confirmed that this business meets the 51%+ Black-ownership standard.
                      </label>
                      <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-gray-500">
                        Verification source
                        <input
                          type="url"
                          value={evidenceUrls[business.id] || ""}
                          onChange={(event) => setEvidenceUrls((current) => ({ ...current, [business.id]: event.target.value }))}
                          placeholder="https://"
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-normal normal-case tracking-normal"
                        />
                      </label>
                      <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-gray-500">
                        Verification details
                        <textarea
                          rows={3}
                          value={evidenceDetails[business.id] || ""}
                          onChange={(event) => setEvidenceDetails((current) => ({ ...current, [business.id]: event.target.value }))}
                          placeholder="Record how ownership was confirmed."
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-normal normal-case tracking-normal"
                        />
                      </label>
                    </div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                      Curator note
                      <textarea
                        rows={3}
                        value={reviewNotes[business.id] || ""}
                        onChange={(event) => setReviewNotes((current) => ({ ...current, [business.id]: event.target.value }))}
                        placeholder="Record what was checked and why this decision was made."
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-normal normal-case tracking-normal"
                      />
                    </label>
                    <div className="mt-3 flex gap-2">
                      <button type="button" disabled={working === business.id} onClick={() => void updateStatus(business, "verified")} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                        <ShieldCheck className="h-4 w-4" /> Publish
                      </button>
                      <button type="button" disabled={working === business.id} onClick={() => void updateStatus(business, "rejected")} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-bold text-red-700 disabled:opacity-50">
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  </div>
                ) : business.reviewNote ? (
                  <div className="mt-5 rounded-xl border border-gray-200 p-4 text-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Curator note</p>
                    <p className="mt-1 text-gray-600">{business.reviewNote}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
