export function Todo({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`tag tag-todo ${className}`}>{children}</span>;
}
