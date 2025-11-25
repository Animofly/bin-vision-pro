import { CheckCircle2, Package, XCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MatchedItem {
  name: string;
  quantityExpected: number;
  quantityDetected: number;
  confidence: number;
  present: boolean;
}

interface ExpectedItem {
  name: string;
  quantity: number;
}

interface AnalysisResults {
  matched: MatchedItem[];
  missing: ExpectedItem[];
}

interface ResultsDisplayProps {
  detectedObjects: AnalysisResults;
}

export const ResultsDisplay = ({ detectedObjects }: ResultsDisplayProps) => {
  const { matched, missing } = detectedObjects;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle2 className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Analysis Complete</h3>
      </div>

      {/* Matched Items */}
      {matched.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Present Items</h4>
            <Badge variant="secondary">{matched.length}</Badge>
          </div>
          <div className="grid gap-3">
            {matched.map((item, idx) => (
              <Card
                key={idx}
                className="p-4 hover:shadow-soft transition-all duration-300 border-border/50 bg-primary/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-foreground mb-1">{item.name}</h5>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">
                        Quantity: <span className="font-medium text-foreground">{item.quantityExpected}</span>
                      </span>
                      <span className="text-primary font-medium">Present</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <p className="text-sm font-semibold text-primary">
                        {(item.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Missing Items */}
      {missing.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <h4 className="font-semibold text-foreground">Missing Items</h4>
            <Badge variant="destructive">{missing.length}</Badge>
          </div>
          <div className="grid gap-2">
            {missing.map((item, idx) => (
              <Card
                key={idx}
                className="p-4 border-destructive/20 bg-destructive/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Expected quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-destructive">Not Found</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Matched</p>
              <p className="text-2xl font-bold text-primary">{matched.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Missing</p>
              <p className="text-2xl font-bold text-destructive">{missing.length}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
