interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 text-vantage-muted">
      {message}
    </div>
  );
}
