// client/src/components/TicketsTable.js

const STATUS_STYLES = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

function formatStatus(value = "") {
  return String(value).replaceAll("_", " ");
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

export default function TicketsTable({ tickets = [], onSelect }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        No support tickets found.
      </div>
    );
  }

  function handleTicketSelect(ticket) {
    if (typeof onSelect === "function") {
      onSelect(ticket);
    }
  }

  function handleTicketKeyDown(event, ticket) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTicketSelect(ticket);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold text-gray-700"
              >
                Customer
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold text-gray-700"
              >
                Category
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold text-gray-700"
              >
                Message
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold text-gray-700"
              >
                Channel
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold text-gray-700"
              >
                Status
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold text-gray-700"
              >
                Received
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                tabIndex={0}
                role="button"
                aria-label={`View ticket from ${
                  ticket.lead_name || "customer"
                }`}
                onClick={() => handleTicketSelect(ticket)}
                onKeyDown={(event) => handleTicketKeyDown(event, ticket)}
                className="cursor-pointer transition hover:bg-gray-50 focus:bg-blue-50 focus:outline-none"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {ticket.lead_name || "Unknown customer"}
                  </div>

                  <div className="text-xs text-gray-500">
                    {ticket.lead_phone || "No phone number"}
                  </div>
                </td>

                <td className="px-4 py-3 capitalize text-gray-700">
                  {formatStatus(ticket.category) || "Other"}
                </td>

                <td className="max-w-xs px-4 py-3 text-gray-700">
                  <div className="truncate" title={ticket.message || ""}>
                    {ticket.message || "No message provided"}
                  </div>
                </td>

                <td className="px-4 py-3 uppercase text-gray-700">
                  {ticket.channel || "—"}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[ticket.status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {formatStatus(ticket.status) || "Unknown"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  {formatDate(ticket.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
