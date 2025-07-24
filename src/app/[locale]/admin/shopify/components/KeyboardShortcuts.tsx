/**
 * Keyboard Shortcuts Component
 * 键盘快捷键支持 - 提供快速操作和导航的键盘快捷键
 */

'use client';

import {
  Command,
  HelpCircle,
  Keyboard,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Keyboard shortcut definition
type KeyboardShortcut = {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: 'navigation' | 'actions' | 'selection' | 'global';
  action: () => void;
  disabled?: boolean;
};

// Keyboard shortcut categories
const SHORTCUT_CATEGORIES = {
  global: 'Global',
  navigation: 'Navigation',
  actions: 'Actions',
  selection: 'Selection',
} as const;

// Hook for managing keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const activeShortcuts = useRef<Map<string, KeyboardShortcut>>(new Map());

  // Convert key combination to string
  const getKeyString = useCallback((event: KeyboardEvent): string => {
    const parts: string[] = [];

    if (event.ctrlKey || event.metaKey) {
      parts.push('mod');
    }
    if (event.altKey) {
      parts.push('alt');
    }
    if (event.shiftKey) {
      parts.push('shift');
    }

    // Handle special keys
    const specialKeys: Record<string, string> = {
      ' ': 'space',
      'Escape': 'escape',
      'Enter': 'enter',
      'Tab': 'tab',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Backspace': 'backspace',
      'Delete': 'delete',
    };

    const key = specialKeys[event.key] || event.key.toLowerCase();
    parts.push(key);

    return parts.join('+');
  }, []);

  // Check if key combination matches shortcut
  const matchesShortcut = useCallback((keyString: string, shortcut: KeyboardShortcut): boolean => {
    const normalizedKeys = shortcut.keys.map(k => k.toLowerCase().replace('cmd', 'mod'));
    return normalizedKeys.includes(keyString);
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT'
      || target.tagName === 'TEXTAREA'
      || target.contentEditable === 'true'
    ) {
      // Only allow help shortcut in inputs
      if (event.key === '?' && event.shiftKey) {
        setIsHelpOpen(true);
        event.preventDefault();
      }
      return;
    }

    const keyString = getKeyString(event);

    // Find matching shortcut
    for (const shortcut of shortcuts) {
      if (!shortcut.disabled && matchesShortcut(keyString, shortcut)) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, getKeyString, matchesShortcut]);

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Update active shortcuts map
  useEffect(() => {
    activeShortcuts.current.clear();
    shortcuts.forEach((shortcut) => {
      activeShortcuts.current.set(shortcut.id, shortcut);
    });
  }, [shortcuts]);

  return {
    isHelpOpen,
    setIsHelpOpen,
    activeShortcuts: Array.from(activeShortcuts.current.values()),
  };
}

// Keyboard shortcuts help modal
type KeyboardShortcutsHelpProps = {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
};

export function KeyboardShortcutsHelp({
  shortcuts,
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category]!.push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  // Format key combination for display
  const formatKeys = (keys: string[]): React.ReactNode => {
    return keys.map((keyCombo, index) => (
      <div key={index} className="flex items-center gap-1">
        {keyCombo.split('+').map((key, keyIndex, array) => (
          <React.Fragment key={keyIndex}>
            <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
              {key.replace('mod', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
                .replace('alt', navigator.platform.includes('Mac') ? '⌥' : 'Alt')
                .replace('shift', '⇧')
                .replace('up', '↑')
                .replace('down', '↓')
                .replace('left', '←')
                .replace('right', '→')
                .replace('enter', '↵')
                .replace('escape', 'Esc')
                .replace('space', '␣')
                .toUpperCase()}
            </kbd>
            {keyIndex < array.length - 1 && (
              <span className="text-muted-foreground">+</span>
            )}
          </React.Fragment>
        ))}
        {index < keys.length - 1 && (
          <span className="text-muted-foreground mx-2">or</span>
        )}
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Keyboard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Keyboard Shortcuts
              </h2>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Speed up your workflow with these keyboard shortcuts
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(SHORTCUT_CATEGORIES).map(([category, title]) => {
              const categoryShortcuts = groupedShortcuts[category];
              if (!categoryShortcuts?.length) {
                return null;
              }

              return (
                <div key={category}>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    {title}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map(shortcut => (
                      <div
                        key={shortcut.id}
                        className={cn(
                          'flex items-center justify-between py-2 px-3 rounded-lg',
                          shortcut.disabled
                            ? 'opacity-50 bg-muted/30'
                            : 'hover:bg-muted/50',
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">
                            {shortcut.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {shortcut.description}
                          </div>
                        </div>
                        <div className="ml-4">
                          {formatKeys(shortcut.keys)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-3 w-3" />
            <span>
              Press
              <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs">?</kbd>
              {' '}
              anytime to show this help
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Predefined Shopify admin shortcuts
export function useShopifyKeyboardShortcuts({
  onRefresh,
  onSearch,
  onNewOrder,
  onExport,
  onImport,
  onSettings,
  onBulkSelect,
  onSelectAll,
  onDeselectAll,
  onNavigateUp,
  onNavigateDown,
}: {
  onRefresh?: () => void;
  onSearch?: () => void;
  onNewOrder?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSettings?: () => void;
  onBulkSelect?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    // Global shortcuts
    {
      id: 'help',
      name: 'Show Help',
      description: 'Display keyboard shortcuts help',
      keys: ['?', 'shift+/'],
      category: 'global',
      action: () => setIsHelpOpen(true),
    },
    {
      id: 'refresh',
      name: 'Refresh',
      description: 'Refresh current data',
      keys: ['mod+r', 'f5'],
      category: 'global',
      action: onRefresh || (() => window.location.reload()),
    },
    {
      id: 'search',
      name: 'Search',
      description: 'Focus search input',
      keys: ['mod+k', '/'],
      category: 'global',
      action: onSearch || (() => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }),
    },

    // Navigation shortcuts
    {
      id: 'navigate-up',
      name: 'Navigate Up',
      description: 'Move selection up',
      keys: ['up', 'k'],
      category: 'navigation',
      action: onNavigateUp || (() => {}),
      disabled: !onNavigateUp,
    },
    {
      id: 'navigate-down',
      name: 'Navigate Down',
      description: 'Move selection down',
      keys: ['down', 'j'],
      category: 'navigation',
      action: onNavigateDown || (() => {}),
      disabled: !onNavigateDown,
    },

    // Action shortcuts
    {
      id: 'new-order',
      name: 'New Order',
      description: 'Create new order',
      keys: ['mod+n'],
      category: 'actions',
      action: onNewOrder || (() => {}),
      disabled: !onNewOrder,
    },
    {
      id: 'export',
      name: 'Export Data',
      description: 'Export current data',
      keys: ['mod+e'],
      category: 'actions',
      action: onExport || (() => {}),
      disabled: !onExport,
    },
    {
      id: 'import',
      name: 'Import Data',
      description: 'Import data from file',
      keys: ['mod+i'],
      category: 'actions',
      action: onImport || (() => {}),
      disabled: !onImport,
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Open settings panel',
      keys: ['mod+,'],
      category: 'actions',
      action: onSettings || (() => {}),
      disabled: !onSettings,
    },

    // Selection shortcuts
    {
      id: 'select-all',
      name: 'Select All',
      description: 'Select all items',
      keys: ['mod+a'],
      category: 'selection',
      action: onSelectAll || (() => {}),
      disabled: !onSelectAll,
    },
    {
      id: 'deselect-all',
      name: 'Deselect All',
      description: 'Clear selection',
      keys: ['escape'],
      category: 'selection',
      action: onDeselectAll || (() => {}),
      disabled: !onDeselectAll,
    },
    {
      id: 'bulk-select',
      name: 'Bulk Select Mode',
      description: 'Toggle bulk selection mode',
      keys: ['shift+space'],
      category: 'selection',
      action: onBulkSelect || (() => {}),
      disabled: !onBulkSelect,
    },
  ];

  const { isHelpOpen, setIsHelpOpen, activeShortcuts } = useKeyboardShortcuts(shortcuts);

  return {
    shortcuts: activeShortcuts,
    isHelpOpen,
    setIsHelpOpen,
    KeyboardShortcutsHelp: () => (
      <KeyboardShortcutsHelp
        shortcuts={activeShortcuts}
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    ),
  };
}

// Keyboard shortcut indicator component
type ShortcutIndicatorProps = {
  keys: string[];
  className?: string;
};

export function ShortcutIndicator({ keys, className }: ShortcutIndicatorProps) {
  const formatKey = (key: string) => {
    return key
      .replace('mod', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
      .replace('alt', navigator.platform.includes('Mac') ? '⌥' : 'Alt')
      .replace('shift', '⇧')
      .replace('enter', '↵')
      .replace('escape', 'Esc')
      .replace('space', '␣')
      .toUpperCase();
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {keys[0]?.split('+').map((key, index, array) => (
        <React.Fragment key={index}>
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded">
            {formatKey(key)}
          </kbd>
          {index < array.length - 1 && (
            <span className="text-muted-foreground text-xs">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Command palette component (future enhancement)
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh] z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-lg w-full">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Command className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              autoFocus
            />
            <ShortcutIndicator keys={['escape']} />
          </div>
        </div>

        <div className="p-2 text-sm text-muted-foreground text-center">
          Command palette coming soon...
        </div>
      </div>
    </div>
  );
}
