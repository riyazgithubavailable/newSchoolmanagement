type PagePlaceholderProps = {
  title: string;
  description?: string;
};

export default function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {title}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {description || "This module is under development."}
        </p>
      </div>

      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed bg-card">
        <div className="text-center">
          <p className="font-medium text-foreground">
            {title}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Dummy UI for navigation testing
          </p>
        </div>
      </div>
    </div>
  );
}