type EmptyStateProps = {
  description?: string;
  title: string;
};

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {description === undefined ? null : <p>{description}</p>}
    </div>
  );
}
