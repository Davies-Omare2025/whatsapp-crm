// client/src/components/TicketDetail.js

import { useEffect, useState } from "react";
import { getTicket, updateTicketStatus } from "../services/api";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const STATUS_STYLES = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

function formatValue(value = "") {
  return String(value).replaceAll("_", " ");
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}

export default function TicketDetail({ ticketId, onClose, onUpdated }) {
  const [ticket, setTicket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!ticketId) {
      setTicket(null);
      setSelectedStatus("");
      setError(null);
      setSuccessMessage("");
      setLoading(false);
      setSaving(false);
      return;
    }

    let isCancelled = false;

    async function fetchTicket() {
      try {
        setLoading(true);
        setError(null);
        setSuccessMessage("");
        setTicket(null);

        const data = await getTicket(ticketId);

        if (!isCancelled) {
          const loadedTicket = data.ticket || null;

          setTicket(loadedTicket);
          setSelectedStatus(loadedTicket?.status || "");
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Failed to load ticket details.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchTicket();

    return () => {
      isCancelled = true;
    };
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [ticketId, onClose]);

  async function handleSaveStatus() {
    if (!ticket || !selectedStatus) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage("");

      const data = await updateTicketStatus(ticket.id, selectedStatus);

      const updatedTicket = {
        ...ticket,
        ...data.ticket,
      };

      setTicket(updatedTicket);
      setSelectedStatus(updatedTicket.status);
      setSuccessMessage("Ticket status updated successfully.");

      if (typeof onUpdated === "function") {
        onUpdated(updatedTicket);
      }
    } catch (err) {
      setError(err.message || "Failed to update ticket status.");
    } finally {
      setSaving(false);
    }
  }

  if (!ticketId) {
    return null;
  }

  const shortReference = ticketId.slice(0, 8).toUpperCase();
  const statusChanged = ticket && selectedStatus !== ticket.status;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-detail-title"
    >
      <button
        type="button"
        aria-label="Close ticket details"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <aside className="relative z-10 h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Ticket #{shortReference}
            </p>

            <h2
              id="ticket-detail-title"
              className="mt-1 text-xl font-bold text-gray-900"
            >
              Support Ticket Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        {loading && (
          <div className="px-6 py-8 text-sm text-gray-500">
            Loading ticket details...
          </div>
        )}

        {!loading && error && (
          <div className="px-6 pt-6">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Error: {error}
            </div>
          </div>
        )}

        {!loading && successMessage && (
          <div className="px-6 pt-6">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          </div>
        )}

        {!loading && !error && !ticket && (
          <div className="px-6 py-8 text-sm text-gray-500">
            Ticket details are not available.
          </div>
        )}

        {!loading && ticket && (
          <div className="space-y-6 px-6 py-6">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Customer
              </h3>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">
                  {ticket.lead_name || "Unknown customer"}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {ticket.lead_phone || "No phone number"}
                </p>

                {ticket.lead_email && (
                  <p className="mt-1 text-sm text-gray-600">
                    {ticket.lead_email}
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Ticket Information
              </h3>

              <dl className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-sm text-gray-500">Category</dt>

                  <dd className="text-sm font-medium capitalize text-gray-900">
                    {formatValue(ticket.category) || "Other"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-sm text-gray-500">Channel</dt>

                  <dd className="text-sm font-medium uppercase text-gray-900">
                    {ticket.channel || "Unknown"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-sm text-gray-500">Current status</dt>

                  <dd>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[ticket.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {formatValue(ticket.status) || "Unknown"}
                    </span>
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-sm text-gray-500">Received</dt>

                  <dd className="text-right text-sm font-medium text-gray-900">
                    {formatDate(ticket.created_at)}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-sm text-gray-500">Last updated</dt>

                  <dd className="text-right text-sm font-medium text-gray-900">
                    {formatDate(ticket.updated_at)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Update Status
              </h3>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <label
                  htmlFor="ticket-status"
                  className="block text-sm font-medium text-gray-700"
                >
                  New status
                </label>

                <select
                  id="ticket-status"
                  value={selectedStatus}
                  onChange={(event) => {
                    setSelectedStatus(event.target.value);
                    setSuccessMessage("");
                  }}
                  disabled={saving}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={saving || !statusChanged}
                  className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {saving ? "Saving..." : "Save Status"}
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Customer Message
              </h3>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {ticket.message || "No message provided."}
                </p>
              </div>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
