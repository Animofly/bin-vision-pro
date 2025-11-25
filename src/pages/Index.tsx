import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { ItemSearch } from "@/components/ItemSearch";
import { ExpectedItemsList } from "@/components/ExpectedItemsList";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { Loader2, Sparkles, Package } from "lucide-react";
import { toast } from "sonner";

interface ExpectedItem {
  name: string;
  quantity: number;
}

interface MatchedItem {
  name: string;
  quantityExpected: number;
  quantityDetected: number;
  confidence: number;
  present: boolean;
}

interface AnalysisResults {
  matched: MatchedItem[];
  missing: ExpectedItem[];
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [expectedItems, setExpectedItems] = useState<ExpectedItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);


  const handleAddItem = (item: ExpectedItem) => {
    setExpectedItems([...expectedItems, item]);
  };

  const handleRemoveItem = (index: number) => {
    setExpectedItems(expectedItems.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error("Please upload a bin image");
      return;
    }

    if (expectedItems.length === 0) {
      toast.error("Please add at least one expected item");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults(null);

    try {
      // TODO: Integrate your model here
      // 1. Load your model
      // 2. Process the selectedImage
      // 3. Get predictions for items in expectedItems
      // 4. Match predictions with expected items
      
      toast.info("Analyzing bin contents...");
      
      // Example structure - replace with your model's output
      const matched: MatchedItem[] = [];
      const missing: ExpectedItem[] = [...expectedItems];
      
      // Placeholder: After your model runs, populate matched and missing arrays
      // matched.push({
      //   name: "Item Name",
      //   quantityExpected: 2,
      //   quantityDetected: 2,
      //   confidence: 0.95,
      //   present: true
      // });

      setAnalysisResults({ matched, missing });
      toast.success("Analysis complete!");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to analyze the bin. Please try again."
      );
      toast.error("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setExpectedItems([]);
    setAnalysisResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Verification</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Bin Content Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Verify bin contents against expected items using advanced AI detection
          </p>
        </header>

        {/* Main Content */}
        <div className="grid gap-6 md:gap-8">
          {/* Input Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 shadow-card border-border/50">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Bin Image
              </h2>
              <ImageUpload
                onImageSelect={setSelectedImage}
                selectedImage={selectedImage}
                onRemove={() => setSelectedImage(null)}
              />
            </Card>

            <div className="space-y-6">
              <ItemSearch 
                onAddItem={handleAddItem} 
                existingItems={expectedItems}
              />
              <ExpectedItemsList 
                items={expectedItems} 
                onRemoveItem={handleRemoveItem}
              />
            </div>
          </div>

          <Card className="p-6 shadow-card border-border/50">
            <Button
              onClick={handleAnalyze}
              disabled={!selectedImage || expectedItems.length === 0 || isAnalyzing}
              className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft"
            >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Bin Contents...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Bin
                  </>
              )}
            </Button>
          </Card>

          {/* Results Section */}
          {(analysisResults || error) && (
            <Card className="p-6 md:p-8 shadow-card border-border/50">
              {error && <ErrorDisplay message={error} onRetry={handleAnalyze} />}
              {analysisResults && (
                <>
                  <ResultsDisplay detectedObjects={analysisResults} />
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full mt-6"
                  >
                    Analyze Another Bin
                  </Button>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
