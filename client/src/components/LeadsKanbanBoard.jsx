import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { LEAD_STATUSES, STATUS_COLORS } from '../constants/leads';

function getBdaName(lead) {
  return lead.assignedTo?.name || 'Unassigned';
}

export default function LeadsKanbanBoard({
  leads,
  onStatusChange,
  updatingLeadId,
}) {
  const leadsByStatus = LEAD_STATUSES.reduce((acc, status) => {
    acc[status] = leads.filter((lead) => lead.status === status);
    return acc;
  }, {});

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const lead = leads.find((l) => l.id === draggableId);

    if (!lead || lead.status === newStatus) return;

    onStatusChange(lead.id, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[480px]">
        {LEAD_STATUSES.map((status) => {
          const columnLeads = leadsByStatus[status] || [];
          const headerColor =
            STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 border-slate-200';

          return (
            <div
              key={status}
              className="flex-shrink-0 w-[min(100%,18rem)] sm:w-72 flex flex-col bg-slate-100/80 rounded-xl border border-slate-200"
            >
              <div
                className={`px-3 py-2.5 rounded-t-xl border-b font-medium text-sm ${headerColor}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{status}</span>
                  <span className="text-xs opacity-80">{columnLeads.length}</span>
                </div>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 space-y-2 min-h-[120px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    {columnLeads.map((lead, index) => (
                      <Draggable
                        key={lead.id}
                        draggableId={lead.id}
                        index={index}
                        isDragDisabled={updatingLeadId === lead.id}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-grab active:cursor-grabbing ${
                              dragSnapshot.isDragging
                                ? 'shadow-md ring-2 ring-blue-200'
                                : 'hover:border-slate-300'
                            } ${updatingLeadId === lead.id ? 'opacity-60' : ''}`}
                          >
                            <p className="font-medium text-slate-900 text-sm">
                              {lead.name}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              {lead.company}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                              {getBdaName(lead)}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
