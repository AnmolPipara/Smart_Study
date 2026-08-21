import { useState, useRef, useEffect } from 'react';
import { NotebookTabs, Plus, Menu, Trash2, ChevronRight, ChevronDown, Folder, FileText, FolderPlus, FilePlus } from 'lucide-react';

export interface NoteSubjectNode {
  id: string;
  name: string;
  children?: NoteSubjectNode[];
  isSubject?: boolean;
  isFolder?: boolean;
}

interface NotesSidebarProps {
  subjects: NoteSubjectNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (parentId: string | null, type: 'folder' | 'note') => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
}

const NotesSidebar = ({
  subjects,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
}: NotesSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createMenuTarget, setCreateMenuTarget] = useState<string | null>(null); // null = root, string = parent folder id
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const createMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close create menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
        setCreateMenuTarget(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus rename input
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openCreateMenu = (e: React.MouseEvent, targetId: string | null) => {
    e.stopPropagation();
    setCreateMenuTarget(targetId);
    setCreateMenuOpen(true);
  };

  const handleCreate = (type: 'folder' | 'note') => {
    onCreate(createMenuTarget, type);
    setCreateMenuOpen(false);
    setCreateMenuTarget(null);
    // Expand the parent so the new item is visible
    if (createMenuTarget) {
      setExpanded(prev => new Set(prev).add(createMenuTarget));
    }
  };

  const startRename = (e: React.MouseEvent, node: NoteSubjectNode) => {
    e.stopPropagation();
    setRenamingId(node.id);
    setRenameValue(node.name);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim() && onRename) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const renderNode = (node: NoteSubjectNode, depth: number) => {
    const isSelected = node.id === selectedId;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isRenaming = renamingId === node.id;
    const isFolder = node.isFolder || hasChildren;

    return (
      <div key={node.id} className="group">
        <div
          className={`w-full flex items-center text-left text-xs rounded-md transition-colors ${
            isSelected
              ? 'bg-[#7C3AED]/15 text-[#7C3AED] font-semibold'
              : 'hover:bg-secondary/80 text-muted-foreground'
          }`}
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          {/* Expand/collapse chevron for folders */}
          {isFolder ? (
            <button type="button" onClick={() => toggleExpand(node.id)} className="p-1 shrink-0">
              {isExpanded
                ? <ChevronDown className="w-3 h-3 text-[#7C3AED]" />
                : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            </button>
          ) : (
            <span className="w-5 shrink-0 flex items-center justify-center">
              <FileText className="w-3 h-3 opacity-40" />
            </span>
          )}

          {/* Icon */}
          {isFolder ? (
            <Folder className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${isExpanded ? 'text-[#7C3AED]' : 'text-amber-500/70'}`} />
          ) : null}

          {/* Name or rename input */}
          {isRenaming ? (
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
              }}
              className="flex-1 text-left py-1.5 truncate bg-background/60 rounded px-1 outline-none border border-primary/40"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <button
              type="button"
              onClick={() => onSelect(node.id)}
              onDoubleClick={(e) => startRename(e, node)}
              className="flex-1 text-left py-1.5 truncate pr-1"
            >
              {node.name}
            </button>
          )}

          {/* Actions */}
          {!isRenaming && (
            <div className="flex items-center gap-0.5 mr-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                  className="p-0.5 rounded hover:bg-red-500/20 text-red-400"
                  title={isFolder ? 'Delete folder and all items inside' : 'Delete'}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`border-r border-border/40 flex flex-col bg-sidebar/80 transition-all duration-300 relative ${
        collapsed ? 'w-12' : 'w-56'
      }`}
    >
      {/* Header */}
      <div className="px-3 py-3 border-b border-border/40 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCollapsed(prev => !prev)}
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
            <div className="relative" ref={createMenuRef}>
              <button
                type="button"
                onClick={(e) => openCreateMenu(e, null)}
                className="p-1 rounded-md bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 shrink-0 transition-colors"
                title="New"
              >
                <Plus className="w-3 h-3" />
              </button>
              {createMenuOpen && createMenuTarget === null && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-secondary border border-border/60 rounded-lg shadow-lg w-40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleCreate('folder')}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-primary/10 flex items-center gap-2 text-foreground"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
                    New Folder
                  </button>
                  <div className="border-t border-border/40" />
                  <button
                    type="button"
                    onClick={() => handleCreate('note')}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-primary/10 flex items-center gap-2 text-foreground"
                  >
                    <FilePlus className="w-3.5 h-3.5 text-[#7C3AED]" />
                    New Note
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* File tree */}
      {!collapsed && (
        <div className="flex-1 overflow-auto px-2 py-2">
          {subjects.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[11px] text-muted-foreground mb-2">
                No notes yet
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Click <span className="text-[#7C3AED] font-semibold">+</span> to create a folder or note
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {subjects.map(node => renderNode(node, 0))}
            </div>
          )}
        </div>
      )}


    </aside>
  );
};

export default NotesSidebar;
