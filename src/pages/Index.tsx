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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<MatchedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Common objects that CLIP can detect
  const commonObjects = [
    "laptop", "computer", "monitor", "keyboard", "mouse", "phone", "tablet",
    "book", "notebook", "pen", "pencil", "paper", "document", "folder",
    "bottle", "cup", "mug", "glass", "plate", "bowl",
    "chair", "desk", "table", "lamp", "clock", "calendar",
    "bag", "backpack", "wallet", "keys", "headphones", "speaker",
    "camera", "charger", "cable", "remote", "controller",
    "plant", "flower", "box", "package", "envelope",
    "tool", "scissors", "tape", "stapler", "calculator",
    "clothing", "shoe", "hat", "glasses", "watch", "jewelry"
  ];

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setDetectedItems([]);

    try {
      toast.info("Loading CLIP model... This may take a minute on first run.");

      // Initialize the CLIP model for zero-shot classification
      const classifier = await pipeline(
        "zero-shot-image-classification",
        "Xenova/clip-vit-base-patch32"
      );

      toast.info("Detecting objects in your image...");

      // Create URL from uploaded image
      const imageUrl = URL.createObjectURL(selectedImage);
      
      // Use common objects as candidate labels for CLIP
      const predictions = await classifier(imageUrl, commonObjects);
      URL.revokeObjectURL(imageUrl);

      console.log("CLIP Predictions:", predictions);

      // Filter predictions with confidence > 0.1 and sort by confidence
      const detected: MatchedItem[] = predictions
        .filter((pred: any) => pred.score > 0.1)
        .map((pred: any) => ({
          name: pred.label,
          quantity: 1,
          confidence: pred.score,
        }))
        .sort((a: MatchedItem, b: MatchedItem) => b.confidence - a.confidence);

      setDetectedItems(detected);
      toast.success(`Found ${detected.length} items in the image!`);
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
    setDetectedItems([]);
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
            AI Object Detector
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload any image and let our AI identify all objects inside with precision and speed
          </p>
        </header>

        {/* Main Content */}
        <div className="grid gap-6 md:gap-8">
          {/* Input Section */}
          <Card className="p-6 md:p-8 shadow-card border-border/50">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Upload Image
                </h2>
                <ImageUpload
                  onImageSelect={setSelectedImage}
                  selectedImage={selectedImage}
                  onRemove={() => setSelectedImage(null)}
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!selectedImage || isAnalyzing}
                className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Detecting Objects...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Detect Objects
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          {(detectedItems.length > 0 || error) && (
            <Card className="p-6 md:p-8 shadow-card border-border/50">
              {error && <ErrorDisplay message={error} onRetry={handleAnalyze} />}
              {detectedItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        Detected Objects
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Found {detectedItems.length} items in your image
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {detectedItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-border/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground capitalize">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {(item.confidence * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">confidence</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full mt-6"
                  >
                    Analyze Another Image
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
