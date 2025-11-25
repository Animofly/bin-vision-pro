import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface DetectedObject {
  name: string;
  confidence: number;
  category?: string;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [objectData, setObjectData] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DetectedObject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (!objectData.trim()) {
      toast.error("Please specify items that should be present");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    // Simulate API call - replace with your actual model endpoint
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock results - replace with actual API response
      const mockResults: DetectedObject[] = [
        { name: "Laptop", confidence: 0.95, category: "Electronics" },
        { name: "Notebook", confidence: 0.87, category: "Stationery" },
        { name: "Pen", confidence: 0.82, category: "Stationery" },
        { name: "Water Bottle", confidence: 0.78, category: "Container" },
      ];

      setResults(mockResults);
      toast.success("Analysis completed successfully!");
    } catch (err) {
      setError(
        "Unable to analyze the image. Please check your image quality and try again."
      );
      toast.error("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setObjectData("");
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Detection</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Amazon Bin Classifier
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload an image of your bin and let our AI identify all objects inside with
            precision and speed
          </p>
        </header>

        {/* Main Content */}
        <div className="grid gap-6 md:gap-8">
          {/* Input Section */}
          <Card className="p-6 md:p-8 shadow-card border-border/50">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Upload Bin Image
                </h2>
                <ImageUpload
                  onImageSelect={setSelectedImage}
                  selectedImage={selectedImage}
                  onRemove={() => setSelectedImage(null)}
                />
              </div>

              <div>
                <label
                  htmlFor="objectData"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Items That Should Be Present{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="objectData"
                  placeholder="Enter the items that should be present in the bin (e.g., electronics, books, bottles)..."
                  value={objectData}
                  onChange={(e) => setObjectData(e.target.value)}
                  className="min-h-[100px] resize-none"
                  required
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!selectedImage || !objectData.trim() || isAnalyzing}
                className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Bin
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          {(results || error) && (
            <Card className="p-6 md:p-8 shadow-card border-border/50">
              {error && <ErrorDisplay message={error} onRetry={handleAnalyze} />}
              {results && <ResultsDisplay detectedObjects={results} />}
              {results && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full mt-6"
                >
                  Analyze Another Image
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
