import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../ui';
import { adminMenuItemBtn } from './adminButtons';

export interface ActionsMenuItem {
  label: string;
  onClick: () => void;
  hidden?: boolean;
}

interface ActionsMenuProps {
  items: ActionsMenuItem[];
}

export function ActionsMenu({ items }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const visibleItems = items.filter((item) => !item.hidden);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <Button
        variant="secondary"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        Actions ▾
      </Button>
      {open && (
        <div className="absolute left-0 z-20 mt-1 min-w-[148px] overflow-hidden rounded-md border border-vantage-border bg-vantage-surface py-1 shadow-lg">
          {visibleItems.map((item) => (
            <MenuButton key={item.label} onClick={() => {
              item.onClick();
              setOpen(false);
            }}>
              {item.label}
            </MenuButton>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className={adminMenuItemBtn}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
