import { useState, useEffect, useRef } from "react";
import { Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface ExpectedItem {
  name: string;
  quantity: number;
}

interface ItemSearchProps {
  onAddItem: (item: ExpectedItem) => void;
  existingItems: ExpectedItem[];
}

export const ItemSearch = ({ onAddItem, existingItems }: ItemSearchProps) => {
  const [productNames, setProductNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load product names from file
    fetch("/unique_product_names.txt")
      .then((response) => response.text())
      .then((text) => {
        const names = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        setProductNames(names);
      })
      .catch((error) => console.error("Error loading product names:", error));
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = productNames
        .filter((name) =>
          name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10); // Show max 10 results
      setFilteredProducts(filtered);
      setShowDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [searchQuery, productNames]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product: string) => {
    setSelectedProduct(product);
    setSearchQuery(product);
    setShowDropdown(false);
  };

  const handleAddItem = () => {
    if (selectedProduct && quantity && parseInt(quantity) > 0) {
      onAddItem({
        name: selectedProduct,
        quantity: parseInt(quantity),
      });
      setSelectedProduct(null);
      setSearchQuery("");
      setQuantity("1");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && selectedProduct) {
      handleAddItem();
    }
  };

  return (
    <Card className="p-6 bg-card border-bin-brown/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-bin-green" />
          <h3 className="text-lg font-semibold text-foreground">Add Expected Items</h3>
        </div>

        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for product name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedProduct(null);
              }}
              onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
              className="pl-10 bg-background border-bin-brown/30"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedProduct(null);
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {showDropdown && filteredProducts.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredProducts.map((product, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full px-4 py-2 text-left hover:bg-accent text-sm text-foreground transition-colors"
                >
                  {product}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedProduct && (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">
                Quantity
              </label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-background border-bin-brown/30"
                placeholder="Enter quantity"
              />
            </div>
            <Button
              onClick={handleAddItem}
              className="mt-6 bg-bin-green hover:bg-bin-green/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
