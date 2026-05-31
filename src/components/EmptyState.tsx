type EmptyStateProps = {
  title: string;
};

export function EmptyState({ title }: EmptyStateProps) {
  return <p className="empty-state">{title}</p>;
}
