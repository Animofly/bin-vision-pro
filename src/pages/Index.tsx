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
      toast.info("Analyzing bin contents...");

      // Prepare bin data in the format expected by the model
      const binData: Record<string, any> = {
        BIN_FCSKU_DATA: {},
        EXPECTED_QUANTITY: expectedItems.reduce((sum, item) => sum + item.quantity, 0)
      };

      expectedItems.forEach((item, index) => {
        const asin = `ASIN_${index}`;
        binData.BIN_FCSKU_DATA[asin] = {
          asin: asin,
          name: item.name,
          normalizedName: item.name,
          quantity: item.quantity,
        };
      });

      // Send to edge function
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('binData', JSON.stringify(binData));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-bin`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const results = await response.json();

      // Parse results and match with expected items
      const matched: MatchedItem[] = [];
      const missing: ExpectedItem[] = [];

      expectedItems.forEach((item) => {
        const result = results.find((r: any) => 
          r.product?.toLowerCase() === item.name.toLowerCase()
        );

        if (result && result.score > 0.1) {
          matched.push({
            name: item.name,
            quantityExpected: item.quantity,
            quantityDetected: item.quantity,
            confidence: result.score,
            present: true
          });
        } else {
          missing.push(item);
        }
      });

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <header className="text-center mb-16 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full mb-4 shadow-soft border border-primary/20">
            <Package className="w-5 h-5 text-primary animate-bin-bounce" />
            <span className="text-sm font-semibold text-primary tracking-wide">AI-Powered Verification</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
            Bin Content Analyzer
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Verify bin contents against expected items using advanced AI detection technology
          </p>
        </header>

        {/* Main Content */}
        <div className="grid gap-8 md:gap-10">
          {/* Input Section */}
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 animate-scale-in">
            <Card className="p-8 shadow-hover border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-hover bg-card/80 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
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

          <Card className="p-6 shadow-card border-border/50 bg-card/80 backdrop-blur-sm animate-scale-in">
            <Button
              onClick={handleAnalyze}
              disabled={!selectedImage || expectedItems.length === 0 || isAnalyzing}
              className="w-full h-14 text-lg font-bold bg-gradient-primary hover:shadow-hover transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Analyzing Bin Contents...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Analyze Bin
                  </>
              )}
            </Button>
          </Card>

          {/* Results Section */}
          {(analysisResults || error) && (
            <Card className="p-8 md:p-10 shadow-hover border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in-up">
              {error && <ErrorDisplay message={error} onRetry={handleAnalyze} />}
              {analysisResults && (
                <>
                  <ResultsDisplay detectedObjects={analysisResults} />
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full mt-8 h-12 text-base font-semibold hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
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
