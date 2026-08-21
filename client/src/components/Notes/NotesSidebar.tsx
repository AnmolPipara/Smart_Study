import { useState } from 'react';
import { NotebookTabs, Plus, Menu, Trash2, ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';

export interface NoteSubjectNode {
  id: string;
  name: string;
  children?: NoteSubjectNode[];
  isSubject?: boolean;
}

interface NotesSidebarProps {
  subjects: NoteSubjectNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (parentId: string | null) => void;
  onDelete?: (id: string) => void;
}

const NotesSidebar = ({
  subjects,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}: NotesSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const toggleSubject = (id: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleNote = (id: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renderNoteNode = (node: NoteSubjectNode, depth: number) => {
    const isSelected = node.id === selectedId;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNotes.has(node.id);
    return (
      <div key={node.id} className="group">
        <div
          className={`w-full flex items-center text-left text-xs rounded-md transition-colors ${
            isSelected
              ? 'bg-[#7C3AED]/15 text-[#7C3AED] font-semibold'
              : 'hover:bg-secondary/80 text-muted-foreground'
          }`
          }
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          {hasChildren ? (
            <button type="button" onClick={() => toggleNote(node.id)} className="p-1 shrink-0">
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : (
            <span className="w-5 shrink-0 flex items-center justify-center">
              <FileText className="w-3 h-3 opacity-50" />
            </span>
          )}
          <button
            type="button"
            onClick={() => onSelect(node.id)}
            className="flex-1 text-left py-1.5 truncate pr-1"
          >
            {node.name}
          </button>
          {onDelete && !node.isSubject && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
              className="p-0.5 mr-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all shrink-0"
              title="Delete note"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNoteNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderSubjectFolder = (node: NoteSubjectNode) => {
    const isExpanded = expandedSubjects.has(node.id);
    const childCount = node.children?.length ?? 0;
    return (
      <div key={node.id} className="mb-1">
        <div className="w-full flex items-center text-left text-xs rounded-md hover:bg-secondary/60 text-foreground/90 font-medium transition-colors">
          <button type="button" onClick={() => toggleSubject(node.id)} className="p-1 shrink-0">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#7C3AED]" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          <Folder className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${isExpanded ? 'text-[#7C3AED]' : 'text-amber-500/70'}`} />
          <button type="button" onClick={() => toggleSubject(node.id)} className="flex-1 text-left truncate py-1.5">
            {node.name}
          </button>
          <span className="text-[10px] text-muted-foreground mr-2 shrink-0">{childCount}</span>
          {onCreate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Create a note under this subject - we need to find a root note in this subject to be the parent
                const firstChild = node.children?.[0];
                onCreate(firstChild?.id ?? null);
              }}
              className="p-0.5 mr-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#7C3AED]/20 text-[#7C3AED] transition-all shrink-0"
              title="Add note to this subject"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="ml-1">
            {node.children.map(child => renderNoteNode(child, 0))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`border-r border-border/40 flex flex-col bg-sidebar/80 transition-all duration-300 ${
        collapsed ? 'w-12' : 'w-56'
      }`}
    >
      <div className="px-3 py-3 border-b border-border/40 flex items-center justify-between gap-2">
        {/* Hamburger toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-1 rounded-md hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-4 h-4" />
        </button>

        {!collapsed && (
          <>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <NotebookTabs className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span className="text-xs font-semibold truncate">Smart Notes</span>
            </div>
            <button
              type="button"
              onClick={() => onCreate(null)}
              className="p-1 rounded-md bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 shrink-0"
              title="New root note"
            >
              <Plus className="w-3 h-3" />
            </button>
          </>
        )}
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-auto px-2 py-2">
          {subjects.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              Start by creating a note and setting its subject,
              e.g. <strong>DBMS</strong> or <strong>Operating System</strong>.
            </p>
          ) : (
            subjects.map((node) => renderSubjectFolder(node))
          )}
        </div>
      )}
    </aside>
  );
};

export default NotesSidebar;
