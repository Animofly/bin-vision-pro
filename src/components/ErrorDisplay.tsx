import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="font-semibold">Analysis Failed</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2 border-destructive/50 hover:bg-destructive/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
