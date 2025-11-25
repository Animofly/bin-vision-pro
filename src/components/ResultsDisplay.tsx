import { CheckCircle2, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DetectedObject {
  name: string;
  confidence: number;
  category?: string;
}

interface ResultsDisplayProps {
  detectedObjects: DetectedObject[];
}

export const ResultsDisplay = ({ detectedObjects }: ResultsDisplayProps) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle2 className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Analysis Complete</h3>
      </div>

      <div className="grid gap-3">
        {detectedObjects.map((obj, idx) => (
          <Card
            key={idx}
            className="p-4 hover:shadow-soft transition-all duration-300 border-border/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{obj.name}</h4>
                    {obj.category && (
                      <Badge variant="secondary" className="text-xs">
                        {obj.category}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium text-foreground">
                        {(obj.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={obj.confidence * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-muted/50 border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Objects Detected
          </span>
          <span className="text-2xl font-bold text-primary">
            {detectedObjects.length}
          </span>
        </div>
      </Card>
    </div>
  );
};
