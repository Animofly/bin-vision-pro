import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { pipeline } from "@huggingface/transformers";

interface MatchedItem {
  name: string;
  quantity: number;
  confidence: number;
}

interface AnalysisResults {
  matched: MatchedItem[];
  missing: string[];
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [itemsFile, setItemsFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (!itemsFile) {
      toast.error("Please upload a text file with items that should be present");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      // Read the text file content
      const itemsText = await itemsFile.text();
      const expectedItems = itemsText
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      console.log("Expected items:", expectedItems);
      
      toast.info("Loading ViT-B model... This may take a minute on first run.");

      // Initialize the Vision Transformer Base model
      const classifier = await pipeline(
        "image-classification",
        "google/vit-base-patch16-224"
      );

      toast.info("Running object detection on your image...");

      // Create URL from uploaded image and run classification
      const imageUrl = URL.createObjectURL(selectedImage);
      const predictions = await classifier(imageUrl, { top_k: 20 });
      URL.revokeObjectURL(imageUrl);

      console.log("ViT-B Predictions:", predictions);

      // Convert predictions to detected objects format
      const detectedObjects = predictions.map((pred: any) => ({
        name: pred.label.split(",")[0].trim(),
        confidence: pred.score,
      }));

      // Match detected objects with expected items
      const matched: MatchedItem[] = [];
      const missing: string[] = [];

      expectedItems.forEach(expectedItem => {
        const matchingObjects = detectedObjects.filter(
          obj => obj.name.toLowerCase().includes(expectedItem.toLowerCase()) ||
                 expectedItem.toLowerCase().includes(obj.name.toLowerCase())
        );

        if (matchingObjects.length > 0) {
          const avgConfidence = matchingObjects.reduce((sum, obj) => sum + obj.confidence, 0) / matchingObjects.length;
          matched.push({
            name: expectedItem,
            quantity: matchingObjects.length,
            confidence: avgConfidence
          });
        } else {
          missing.push(expectedItem);
        }
      });

      setResults({ matched, missing });
      toast.success("Analysis completed successfully!");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to analyze the image. Please try again."
      );
      toast.error("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setItemsFile(null);
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
                  htmlFor="itemsFile"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Items That Should Be Present{" "}
                  <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    id="itemsFile"
                    type="file"
                    accept=".txt"
                    onChange={(e) => setItemsFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 file:cursor-pointer cursor-pointer border border-input rounded-md bg-background"
                    required
                  />
                  {itemsFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {itemsFile.name}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!selectedImage || !itemsFile || isAnalyzing}
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
