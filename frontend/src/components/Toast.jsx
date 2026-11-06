import { useCart } from "../context/CartContext";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "error":
        return <AlertCircle size={20} className="toast-icon-error" />;
      case "info":
        return <Info size={20} className="toast-icon-info" />;
      default:
        return <CheckCircle2 size={20} className="toast-icon-success" />;
    }
  };

  return (
    <div className={`toast-notification toast-${toast.type || "success"}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{toast.message}</span>
      </div>
    </div>
  );
}
