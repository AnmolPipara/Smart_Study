import { useState } from 'react';
import { NotebookTabs, Plus, Menu } from 'lucide-react';

export interface NoteSubjectNode {
  id: string;
  name: string;
  children?: NoteSubjectNode[];
}

interface NotesSidebarProps {
  subjects: NoteSubjectNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (parentId: string | null) => void;
}

const NotesSidebar = ({
  subjects,
  selectedId,
  onSelect,
  onCreate,
}: NotesSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const renderNode = (node: NoteSubjectNode, depth = 0) => {
    const isSelected = node.id === selectedId;
    return (
      <div key={node.id} className="mb-1">
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={`w-full flex items-center justify-between text-left text-xs px-2 py-1.5 rounded-md ${
            isSelected
              ? 'bg-[#7C3AED]/15 text-[#7C3AED] font-semibold'
              : 'hover:bg-secondary/80 text-muted-foreground'
          }`}
          style={{ paddingLeft: 8 + depth * 12 }}
        >
          <span className="truncate">{node.name}</span>
        </button>
        {node.children && node.children.length > 0 && (
          <div className="mt-0.5">
            {node.children.map((child) => renderNode(child, depth + 1))}
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
              Start by creating a subject like <strong>Operating System</strong> or{' '}
              <strong>Machine Learning</strong>.
            </p>
          ) : (
            subjects.map((node) => renderNode(node))
          )}
        </div>
      )}
    </aside>
  );
};

export default NotesSidebar;
