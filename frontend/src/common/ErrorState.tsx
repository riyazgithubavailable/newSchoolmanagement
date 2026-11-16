interface ErrorStateProps {
  message?: string;
}

const ErrorState = ({
  message = "Something went wrong.",
}: ErrorStateProps) => {
  return (
    <div className="flex h-40 items-center justify-center text-destructive text-lg font-medium">
      {message}
    </div>
  );
};

export default ErrorState;