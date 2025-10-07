import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface WalletInputProps {
  onAddressSubmit: (address: string) => void;
  currentAddress?: string;
}

export const WalletInput = ({ onAddressSubmit, currentAddress }: WalletInputProps) => {
  const [inputValue, setInputValue] = useState(currentAddress || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddressSubmit(inputValue.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <Input
        type="text"
        placeholder="Enter wallet address (0x...)"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="default">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
};
