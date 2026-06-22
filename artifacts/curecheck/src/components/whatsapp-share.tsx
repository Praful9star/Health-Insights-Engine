import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppShareProps {
  text: string;
  label?: string;
  className?: string;
}

export function WhatsAppShare({ text, label = "Share on WhatsApp", className }: WhatsAppShareProps) {
  const handleShare = () => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className={`gap-2 min-w-0 max-w-full border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 ${className}`}
      data-testid="button-whatsapp-share"
    >
      <MessageCircle className="w-4 h-4 fill-current flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Button>
  );
}
