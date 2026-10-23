// Marks a fact that is still missing (see CONTENT_TODO.md).
export function Todo({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`todo ${className}`}>{children}</span>;
}
