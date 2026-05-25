import { useState, useRef } from "react";

// ─── Initial Data ────────────────────────────────────────────────────────────
const INITIAL_DAYS = [
  {
    id: "day-1",
    day: 1,
    date: "Saturday, June 14",
    items: [
      {
        id: "item-depart",
        type: "depart",
        time: "08:00 AM",
        title: "Depart from Blue Rock Beach Resort",
        sub: "Starting point · Zambales",
        visited: false,
      },
      {
        id: "item-anawangin",
        type: "attraction",
        time: "08:30 AM",
        title: "Anawangin Cove",
        sub: "Nature · Swimming · Photography · 3–4 hrs",
        visited: true,
      },
      {
        id: "item-meal",
        type: "break",
        time: "12:00 PM",
        title: "Meal Break",
        sub: "12:00 PM – 01:00 PM",
        visited: false,
      },
      {
        id: "item-capones",
        type: "attraction",
        time: "01:00 PM",
        title: "Capones Island",
        sub: "Island · Lighthouse · Snorkeling · 2–3 hrs",
        visited: false,
      },
      {
        id: "item-iba",
        type: "attraction",
        time: "04:00 PM",
        title: "Iba Fish Market",
        sub: "Local Food · Market · Photography · 1 hr",
        visited: false,
      },
    ],
  },
  {
    id: "day-2",
    day: 2,
    date: "Sunday, June 15",
    items: [],
  },
];

const TRIP = {
  name: "Zambales Beach Getaway",
  destination: "Zambales",
  hotel: "Blue Rock Beach Resort",
  startTime: "08:00 AM",
  budget: "Balanced",
  pace: "Moderate",
  startDate: "Jun 14",
  endDate: "Jun 15, 2025",
};

// ─── Dot connector colours ────────────────────────────────────────────────────
function dotColor(type) {
  if (type === "break") return "bg-amber-400 outline-amber-400";
  if (type === "depart") return "bg-gray-400 outline-gray-400";
  return "bg-blue-600 outline-blue-600";
}
function connectorColor(type) {
  if (type === "break") return "bg-amber-200";
  return "bg-blue-100";
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ item, onClose, onSave }) {
  const [time, setTime] = useState(item.time);
  const [title, setTitle] = useState(item.title);

  function handleSave() {
    onSave({ ...item, time, title });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-1">
            Edit Stop
          </p>
          <h2 className="text-lg font-bold text-white">{item.title}</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Place / Title
            </label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Time
            </label>
            <input
              type="time"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={
                // convert "08:30 AM" → "08:30" for input[type=time]
                (() => {
                  const [t, period] = time.split(" ");
                  if (!period) return time;
                  let [h, m] = t.split(":");
                  h = parseInt(h);
                  if (period === "PM" && h !== 12) h += 12;
                  if (period === "AM" && h === 12) h = 0;
                  return `${String(h).padStart(2, "0")}:${m}`;
                })()
              }
              onChange={(e) => {
                const [h, m] = e.target.value.split(":");
                const hour = parseInt(h);
                const period = hour >= 12 ? "PM" : "AM";
                const h12 = hour % 12 || 12;
                setTime(`${String(h12).padStart(2, "0")}:${m} ${period}`);
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Item ─────────────────────────────────────────────────────────────
function TimelineItem({
  item,
  isLast,
  isEditing,
  onToggleVisited,
  onDelete,
  onEditItem,
  dayId,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  draggingId,
}) {
  const isDragging = draggingId === item.id;

  const cardBase =
    "flex-1 rounded-xl border px-4 py-3 transition-all duration-200 select-none";
  const cardVariant =
    item.type === "break"
      ? "border-l-4 border-amber-400 bg-amber-50 border-r border-t border-b border-r-amber-100 border-t-amber-100 border-b-amber-100"
      : item.type === "depart"
      ? "bg-sky-50 border-sky-200"
      : item.visited
      ? "bg-green-50 border-green-200"
      : "bg-white border-gray-200";

  const cardEditing = isEditing
    ? "shadow-lg ring-2 ring-blue-200 cursor-grab active:cursor-grabbing"
    : "";

  const cardDragging = isDragging ? "opacity-40 scale-95" : "opacity-100";

  return (
    <div
      className={`flex gap-3 ${isDragging ? "opacity-40" : ""}`}
      draggable={isEditing}
      onDragStart={isEditing ? () => onDragStart(item.id, dayId) : undefined}
      onDragOver={isEditing ? (e) => { e.preventDefault(); onDragOver(item.id, dayId); } : undefined}
      onDrop={isEditing ? () => onDrop(item.id, dayId) : undefined}
    >
      {/* Timeline left */}
      <div className="flex flex-col items-center w-12 flex-shrink-0">
        <span className="text-[11px] font-bold text-blue-600 whitespace-nowrap mb-1">
          {item.time}
        </span>
        <div
          className={`w-2.5 h-2.5 rounded-full border-2 border-white outline outline-2 flex-shrink-0 ${dotColor(item.type)}`}
        />
        {!isLast && (
          <div className={`flex-1 w-0.5 mt-1 min-h-[20px] ${connectorColor(item.type)}`} />
        )}
      </div>

      {/* Card */}
      <div className={`${cardBase} ${cardVariant} ${cardEditing} ${cardDragging} mb-2`}>
        <div className="flex items-center gap-2">
          {/* Drag handle — only in edit mode */}
          {isEditing && (
            <div className="flex flex-col gap-[3px] flex-shrink-0 cursor-grab pr-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-[3px]">
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{item.sub}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isEditing ? (
              <>
                {/* Edit icon button */}
                <button
                  onClick={() => onEditItem(item)}
                  className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                </button>
                {/* Delete */}
                <button
                  onClick={() => onDelete(dayId, item.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                {/* Visited check — only for non-break, non-depart */}
                {item.type !== "break" && (
                  <button
                    onClick={() => onToggleVisited(dayId, item.id)}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                      item.visited
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                    }`}
                    title={item.visited ? "Mark as not visited" : "Mark as visited"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                {/* Break gets edit + delete even in view mode */}
                {item.type === "break" && (
                  <>
                    <button
                      onClick={() => onEditItem(item)}
                      className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      title="Edit break"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(dayId, item.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                      title="Delete break"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                )}
                {/* Attraction: only trash (no edit in view mode) */}
                {item.type === "attraction" && (
                  <button
                    onClick={() => onDelete(dayId, item.id)}
                    className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ItineraryPage() {
  const [days, setDays] = useState(INITIAL_DAYS);
  const [isEditing, setIsEditing] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const dragItem = useRef(null);   // { id, dayId }
  const dragOver = useRef(null);   // { id, dayId }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalDays = days.length;
  const totalAttractions = days.reduce(
    (acc, d) => acc + d.items.filter((i) => i.type === "attraction").length,
    0
  );

  // ── Actions ────────────────────────────────────────────────────────────────
  function toggleVisited(dayId, itemId) {
    setDays((prev) =>
      prev.map((d) =>
        d.id !== dayId
          ? d
          : {
              ...d,
              items: d.items.map((i) =>
                i.id === itemId ? { ...i, visited: !i.visited } : i
              ),
            }
      )
    );
  }

  function deleteItem(dayId, itemId) {
    setDays((prev) =>
      prev.map((d) =>
        d.id !== dayId
          ? d
          : { ...d, items: d.items.filter((i) => i.id !== itemId) }
      )
    );
  }

  function saveItemEdit(updatedItem) {
    setDays((prev) =>
      prev.map((d) => ({
        ...d,
        items: d.items.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
      }))
    );
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────
  function handleDragStart(itemId, dayId) {
    dragItem.current = { itemId, dayId };
  }

  function handleDragOver(itemId, dayId) {
    dragOver.current = { itemId, dayId };
  }

  function handleDrop() {
    if (!dragItem.current || !dragOver.current) return;
    if (dragItem.current.itemId === dragOver.current.itemId) return;
    // Only allow reorder within same day for simplicity
    if (dragItem.current.dayId !== dragOver.current.dayId) return;

    const dayId = dragItem.current.dayId;
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const items = [...d.items];
        const fromIdx = items.findIndex((i) => i.id === dragItem.current.itemId);
        const toIdx = items.findIndex((i) => i.id === dragOver.current.itemId);
        const [moved] = items.splice(fromIdx, 1);
        items.splice(toIdx, 0, moved);
        return { ...d, items };
      })
    );
    dragItem.current = null;
    dragOver.current = null;
  }

  // ── Sidebar day summary ────────────────────────────────────────────────────
  const day1 = days[0];
  const day1Attractions = day1?.items.filter((i) => i.type === "attraction") ?? [];
  const day1Visited = day1Attractions.filter((i) => i.visited).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Header ── */}
      <div className="bg-blue-600 px-10 pt-5 pb-6">
        {/* Back */}
        <button className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-widest mb-1">
              Itinerary
            </p>
            <h1 className="text-2xl font-bold text-white mb-1">{TRIP.name}</h1>
            <div className="flex items-center gap-1.5 text-blue-200 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
              </svg>
              {TRIP.destination} · {TRIP.hotel}
            </div>
          </div>

          {/* Edit / Save + Delete */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isEditing
                  ? "bg-white text-blue-700 hover:bg-blue-50"
                  : "bg-white/15 border border-white/30 text-white hover:bg-white/20"
              }`}
            >
              {isEditing ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Save Itinerary
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                  Edit Itinerary
                </>
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/20 border border-red-300/40 text-red-200 hover:bg-red-500/30 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
              </svg>
              Delete Itinerary
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-7">
          {[
            { label: "Dates", value: `${TRIP.startDate}–${TRIP.endDate}` },
            { label: "Days", value: totalDays },
            { label: "Attractions", value: totalAttractions },
            { label: "Start time", value: TRIP.startTime },
            { label: "Pace", value: TRIP.pace },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[11px] text-blue-300 mb-0.5">{s.label}</p>
              <p className="text-[15px] font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1060px] mx-auto px-10 py-7">
        <div className="grid grid-cols-[1fr_272px] gap-6 items-start">

          {/* Left — Days */}
          <div>
            {isEditing && (
              <div className="mb-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                Editing mode — drag the ⠿ handle to reorder stops. Click edit to change time or title.
              </div>
            )}

            {days.map((day) => (
              <div key={day.id} className="mb-8">
                {/* Day header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Day {day.day}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">{day.date}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {day.items.length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 rounded-xl px-5 py-5 text-center">
                    <p className="text-sm text-gray-400">No attractions scheduled for this day.</p>
                  </div>
                ) : (
                  <div>
                    {day.items.map((item, idx) => (
                      <TimelineItem
                        key={item.id}
                        item={item}
                        isLast={idx === day.items.length - 1}
                        isEditing={isEditing}
                        dayId={day.id}
                        index={idx}
                        onToggleVisited={toggleVisited}
                        onDelete={deleteItem}
                        onEditItem={setModalItem}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        draggingId={null}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Trip overview */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">Trip overview</span>
              </div>
              <div className="px-4 py-3 flex flex-col divide-y divide-gray-50">
                {[
                  { label: "Itinerary", value: TRIP.name.replace("Zambales ", "") },
                  { label: "Destination", value: TRIP.destination },
                  { label: "Dates", value: `${TRIP.startDate}–${TRIP.endDate}` },
                  { label: "Start time", value: TRIP.startTime },
                  { label: "Budget", value: TRIP.budget },
                  { label: "Pace", value: TRIP.pace },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between py-1.5">
                    <span className="text-xs text-gray-500">{r.label}</span>
                    <span className="text-xs font-semibold text-gray-800">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day 1 summary */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
                  <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">Day 1 summary</span>
              </div>
              <div className="px-4 py-3 flex flex-col divide-y divide-gray-50">
                {[
                  { label: "Attractions", value: `${day1Attractions.length} stops` },
                  { label: "Est. duration", value: "~8 hrs" },
                  { label: "Wrap up", value: "~05:00 PM" },
                  {
                    label: "Visited",
                    value: `${day1Visited} / ${day1Attractions.length}`,
                    green: true,
                  },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between py-1.5">
                    <span className="text-xs text-gray-500">{r.label}</span>
                    <span className={`text-xs font-semibold ${r.green ? "text-green-600" : "text-gray-800"}`}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">Legend</span>
              </div>
              <div className="px-4 py-3 flex flex-col gap-2">
                {[
                  { color: "bg-blue-600", label: "Attraction" },
                  { color: "bg-amber-400", label: "Break" },
                  { color: "bg-green-500", label: "Visited" },
                  { color: "bg-gray-400", label: "Departure" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${l.color}`} />
                    <span className="text-xs text-gray-600">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Back to dashboard */}
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Back to dashboard
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {modalItem && (
        <EditModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSave={saveItemEdit}
        />
      )}
    </div>
  );
}