import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Package } from "lucide-react";

interface ExpectedItem {
  name: string;
  quantity: number;
}

interface ExpectedItemsListProps {
  items: ExpectedItem[];
  onRemoveItem: (index: number) => void;
}

export const ExpectedItemsList = ({ items, onRemoveItem }: ExpectedItemsListProps) => {
  if (items.length === 0) {
    return (
      <Card className="p-8 bg-card border-bin-brown/20 text-center">
        <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground animate-bin-bounce" />
        <p className="text-muted-foreground">No items added yet. Use the search above to add expected items.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-bin-brown/20">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-bin-orange" />
        <h3 className="text-lg font-semibold text-foreground">Expected Items ({items.length})</h3>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-background rounded-lg border border-bin-brown/20 hover:border-bin-brown/40 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveItem(index)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
