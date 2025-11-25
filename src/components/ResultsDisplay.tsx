import { CheckCircle2, Package, XCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MatchedItem {
  name: string;
  quantity: number;
  confidence: number;
}

interface AnalysisResults {
  matched: MatchedItem[];
  missing: string[];
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
            <h4 className="font-semibold text-foreground">Matched Items</h4>
            <Badge variant="secondary">{matched.length}</Badge>
          </div>
          <div className="grid gap-3">
            {matched.map((item, idx) => (
              <Card
                key={idx}
                className="p-4 hover:shadow-soft transition-all duration-300 border-border/50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-foreground">{item.name}</h5>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Qty: {item.quantity}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium text-foreground">
                        {(item.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={item.confidence * 100} className="h-2" />
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
                className="p-3 border-destructive/20 bg-destructive/5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-sm font-medium text-foreground">{item}</span>
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
