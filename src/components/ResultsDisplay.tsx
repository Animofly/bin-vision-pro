import { CheckCircle2, Package, XCircle, TrendingUp, FileImage } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-primary animate-scale-in">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold">Analysis Complete</h3>
      </div>

      {/* Matched Items */}
      {matched.length > 0 && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h4 className="text-xl font-bold text-foreground">Present Items</h4>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-sm px-3 py-1">{matched.length}</Badge>
          </div>
          <div className="grid gap-4">
            {matched.map((item, idx) => (
              <Card
                key={idx}
                className="p-5 hover:shadow-hover transition-all duration-300 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 hover:scale-[1.01] hover:border-primary/30"
                style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-bold text-foreground mb-2 text-lg">{item.name}</h5>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Quantity: <span className="font-bold text-foreground text-base">{item.quantityExpected}</span>
                      </span>
                      <Badge className="bg-primary text-primary-foreground">Present</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <p className="text-lg font-bold text-primary">
                        {(item.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Missing Items */}
      {missing.length > 0 && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <h4 className="text-xl font-bold text-foreground">Missing Items</h4>
            <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-sm px-3 py-1">{missing.length}</Badge>
          </div>
          <div className="grid gap-3">
            {missing.map((item, idx) => (
              <Card
                key={idx}
                className="p-5 border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10 hover:shadow-soft transition-all duration-300 hover:border-destructive/40"
                style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <XCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground mb-1">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Expected quantity: <span className="font-semibold">{item.quantity}</span>
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-destructive text-destructive-foreground">Not Found</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30 animate-bin-fill shadow-hover animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center gap-6">
          <div className="p-4 bg-gradient-primary rounded-xl animate-bin-bounce shadow-soft">
            <TrendingUp className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Matched Items</p>
              <p className="text-4xl font-bold text-primary">{matched.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Missing Items</p>
              <p className="text-4xl font-bold text-destructive">{missing.length}</p>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};
