// client/src/pages/Dashboard.js

import { useCallback, useEffect, useState } from "react";
import { listLeads, listTickets } from "../services/api";
import StatsCards from "../components/StatsCards";
import LeadsTable from "../components/LeadsTable";
import TicketsTable from "../components/TicketsTable";
import LeadDetail from "../components/LeadDetail";
import TicketDetail from "../components/TicketDetail";
import socket from "../lib/socket";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");

  const [leads, setLeads] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("leads");

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  function handleLeadSelect(lead) {
    setSelectedTicketId(null);
    setSelectedLeadId(lead.id);
  }

  function handleTicketSelect(ticket) {
    setSelectedLeadId(null);
    setSelectedTicketId(ticket.id);
  }

  function handleTabChange(nextTab) {
    setActiveTab(nextTab);
    setSelectedLeadId(null);
    setSelectedTicketId(null);
  }

  function handleTicketUpdated(updatedTicket) {
    if (!updatedTicket?.id) {
      return;
    }

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === updatedTicket.id
          ? {
              ...ticket,
              ...updatedTicket,
            }
          : ticket,
      ),
    );

    setRefreshKey((currentKey) => currentKey + 1);
  }

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const [leadsData, ticketsData] = await Promise.all([
        listLeads({
          search,
          status,
          assignedTo: assignedFilter,
        }),
        listTickets(),
      ]);

      setLeads(leadsData.leads || []);
      setTickets(ticketsData.tickets || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [search, status, assignedFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshKey]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshKey((currentKey) => currentKey + 1);
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function handleNewMessage() {
      console.log("New message received. Refreshing dashboard...");
      setRefreshKey((currentKey) => currentKey + 1);
    }

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mctaba CRM</h1>

            <p className="text-sm text-gray-500">
              Customer leads and support tickets — Nairobi
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {currentUser?.name} ({currentUser?.role})
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        {currentUser?.role === "admin" && (
          <StatsCards refreshKey={refreshKey} />
        )}

        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="inline-flex rounded-lg border border-gray-300 bg-white p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "leads"}
            onClick={() => handleTabChange("leads")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === "leads"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Leads
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "tickets"}
            onClick={() => handleTabChange("tickets")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === "tickets"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Support Tickets
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Error: {error}
          </div>
        )}

        {activeTab === "leads" && (
          <section role="tabpanel" aria-label="Leads" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Leads</h2>

              <p className="text-sm text-gray-500">
                View and manage customer leads.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, phone, or email"
                aria-label="Search leads"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="Filter leads by status"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={assignedFilter}
                onChange={(event) => setAssignedFilter(event.target.value)}
                aria-label="Filter leads by assignment"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
              >
                <option value="">All leads</option>
                <option value="unassigned">Unassigned only</option>
              </select>
            </div>

            {loading ? (
              <div className="text-sm text-gray-500">Loading leads...</div>
            ) : (
              <LeadsTable leads={leads} onSelect={handleLeadSelect} />
            )}
          </section>
        )}

        {activeTab === "tickets" && (
          <section
            role="tabpanel"
            aria-label="Support tickets"
            className="space-y-4"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Support Tickets
              </h2>

              <p className="text-sm text-gray-500">
                Tickets submitted through USSD, WhatsApp, and the web.
              </p>
            </div>

            {loading ? (
              <div className="text-sm text-gray-500">
                Loading support tickets...
              </div>
            ) : (
              <TicketsTable tickets={tickets} onSelect={handleTicketSelect} />
            )}
          </section>
        )}
      </main>

      <LeadDetail
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onUpdated={() => setRefreshKey((currentKey) => currentKey + 1)}
      />

      <TicketDetail
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onUpdated={handleTicketUpdated}
      />
    </div>
  );
}
