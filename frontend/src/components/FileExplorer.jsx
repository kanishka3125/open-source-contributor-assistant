import { useState } from "react";
import {
  IconFolder,
  IconFolderOpen,
  IconFile,
  IconChevronRight,
  IconChevronDown,
  IconSearch,
} from "./Icons";

export default function FileExplorer({
  treeData,
  selectedFile,
  onSelectFile,
  repoName,
}) {
  const [openFolders, setOpenFolders] = useState({
    "src": true,
    "src/auth": true,
    "src/api": true,
    "tests": false,
  });
  const [filterText, setFilterText] = useState("");

  const toggleFolder = (path) => {
    setOpenFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderNode = (node, depth = 0) => {
    if (node.type === "folder") {
      const isOpen = !!openFolders[node.path];
      const matchesFilter = filterText
        ? node.name.toLowerCase().includes(filterText.toLowerCase()) ||
          node.children?.some((c) => c.name.toLowerCase().includes(filterText.toLowerCase()))
        : true;

      if (!matchesFilter) return null;

      return (
        <div key={node.path} className="tree-folder-group">
          <div
            className={`tree-item folder-item depth-${depth}`}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            <span className="tree-chevron">
              {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            </span>
            <span className="tree-folder-icon">
              {isOpen ? <IconFolderOpen size={16} /> : <IconFolder size={16} />}
            </span>
            <span className="tree-label">{node.name}</span>
          </div>

          {isOpen && (
            <div className="tree-children">
              {node.children?.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File item
    const isSelected = selectedFile?.path === node.path;
    if (filterText && !node.name.toLowerCase().includes(filterText.toLowerCase())) {
      return null;
    }

    return (
      <div
        key={node.path}
        className={`tree-item file-item depth-${depth} ${isSelected ? "is-selected" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 28}px` }}
        onClick={() => onSelectFile(node)}
      >
        <IconFile size={15} className="tree-file-icon" />
        <span className="tree-label">{node.name}</span>
        {node.lang && <span className="tree-file-ext">{node.lang}</span>}
      </div>
    );
  };

  return (
    <div className="file-explorer-pane">
      <div className="explorer-header">
        <div className="explorer-title">
          <span className="explorer-title-text">EXPLORER</span>
          <span className="explorer-repo-name">{repoName}</span>
        </div>
        <div className="explorer-filter-bar">
          <IconSearch size={13} className="filter-search-icon" />
          <input
            type="text"
            className="filter-input"
            placeholder="Filter files..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      <div className="explorer-tree-view">
        {treeData.map((rootNode) => renderNode(rootNode, 0))}
      </div>
    </div>
  );
}
