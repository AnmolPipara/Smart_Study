import { StudyTask } from '@/types/study';
import { format, isToday } from 'date-fns';
import { CheckCircle2, ListTodo, SunMedium, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useCallback } from 'react';

interface KanbanPlannerProps {
  tasks: StudyTask[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: StudyTask) => void;
}

type ColumnId = 'today' | 'upcoming' | 'completed';

const KanbanPlanner = ({ tasks, onToggle, onDelete, onEdit }: KanbanPlannerProps) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const columns: { id: ColumnId; title: string; description: string; icon: typeof SunMedium; tasks: StudyTask[] }[] = [
    {
      id: 'today',
      title: 'Today',
      description: 'Tasks due today',
      icon: SunMedium,
      tasks: tasks.filter((t) => format(new Date(t.deadline), 'yyyy-MM-dd') === todayStr && !t.completed),
    },
    {
      id: 'upcoming',
      title: 'Upcoming',
      description: 'Tasks due after today',
      icon: ListTodo,
      tasks: tasks.filter((t) => format(new Date(t.deadline), 'yyyy-MM-dd') !== todayStr && !t.completed),
    },
    {
      id: 'completed',
      title: 'Completed',
      description: 'Finished tasks',
      icon: CheckCircle2,
      tasks: tasks.filter((t) => t.completed),
    },
  ];

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const sourceColumn = result.source.droppableId as ColumnId;
    const destColumn = destination.droppableId as ColumnId;

    if (sourceColumn === destColumn) return;

    // If moved to/from completed, toggle completion
    if (destColumn === 'completed' || sourceColumn === 'completed') {
      onToggle(draggableId);
    }
  }, [onToggle]);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Kanban Study Board</h2>
        <p className="text-xs text-muted-foreground">
          Drag tasks between columns to update their status.
        </p>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <section
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`glass rounded-xl p-3 flex flex-col min-h-[260px] transition-colors ${
                    snapshot.isDraggingOver ? 'ring-2 ring-primary/40 bg-primary/5' : ''
                  }`}
                >
                  <header className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                        <column.icon className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{column.title}</h3>
                        <p className="text-[10px] text-muted-foreground">
                          {column.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-secondary/70">
                      {column.tasks.length} tasks
                    </span>
                  </header>

                  <div className="space-y-2 flex-1">
                    {column.tasks.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground/60 text-center py-6">
                        No tasks here yet.
                      </p>
                    ) : (
                      column.tasks.map((task, index) => {
                        const deadline = new Date(task.deadline);
                        const isTodayDeadline = isToday(deadline);
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={[
                                  'group w-full text-left rounded-lg p-3 text-xs transition-all shadow-card border border-border bg-card hover:bg-secondary/50 cursor-grab active:cursor-grabbing',
                                  snapshot.isDragging ? 'ring-2 ring-primary shadow-lg rotate-1 scale-105' : '',
                                ].join(' ')}
                                onClick={() => onEdit(task)}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <p className="font-semibold truncate text-foreground">
                                    {task.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(task.id);
                                      }}
                                      className="p-1 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded transition-colors"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onToggle(task.id);
                                      }}
                                      className="p-1 rounded opacity-100! hover:bg-white/10 transition-colors"
                                    >
                                      {task.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                                      ) : (
                                        <span className="w-4 h-4 inline-block rounded-full border border-blue-500/60" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[11px] text-muted-foreground mb-1">
                                  {task.subject}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                  <span>{task.estimatedMinutes} min</span>
                                  <span>
                                    {isTodayDeadline
                                      ? 'Due today'
                                      : format(deadline, 'MMM d')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                </section>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanPlanner;
