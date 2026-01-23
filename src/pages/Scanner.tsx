import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Zap, ArrowLeft, CheckCircle, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";

const Scanner = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Auto-scan when accessed via QR code
  useEffect(() => {
    if (searchParams.get("auto") === "true") {
      handleScan();
    }
  }, [searchParams]);

  const handleScan = async () => {
    setLoading(true);
    try {
      // Record the scan
      const energyGenerated = (Math.random() * 0.1 + 0.15).toFixed(2); // Random between 0.15-0.25 kWh

      const { error } = await supabase.from("scans").insert({
        energy_generated: parseFloat(energyGenerated),
        location: "Main Entrance",
      });

      if (error) throw error;

      setScanSuccess(true);
      toast.success(`Scan successful! Generated ${energyGenerated} kWh`);

      // Reset after 2 seconds
      setTimeout(() => {
        setScanSuccess(false);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scanUrl = `${window.location.origin}/scanner?auto=true`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              <span>QR Code Scanner</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Scan Your Code
            </h1>
            <p className="text-muted-foreground">
              Pass through the turnstile to generate sustainable energy
            </p>
          </div>

          {!showQRCode ? (
            <Card className="p-8 border-border/50">
              <div className="space-y-6">
                {/* QR Code Display Area */}
                <div className="relative aspect-square bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  {scanSuccess ? (
                    <div className="text-center animate-in zoom-in duration-300">
                      <CheckCircle className="h-20 w-20 text-success mx-auto mb-4" />
                      <p className="text-lg font-semibold text-success">
                        Scan Successful!
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCode className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Ready to scan
                      </p>
                    </div>
                  )}
                </div>

                {/* Scan Button */}
                <Button
                  onClick={handleScan}
                  disabled={loading || scanSuccess}
                  className="w-full h-12 text-lg"
                >
                  {loading ? "Processing..." : scanSuccess ? "Success!" : "Simulate Scan"}
                </Button>

                {/* Generate QR Code Button */}
                <Button
                  onClick={() => setShowQRCode(true)}
                  variant="outline"
                  className="w-full h-12 text-lg"
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Generate Printable QR Code
                </Button>

                {/* Info */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Each scan generates approximately 0.20 kWh of clean energy
                    that powers our facility
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 border-border/50">
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Printable QR Code</h2>
                  <p className="text-sm text-muted-foreground">
                    Print this QR code and place it at your turnstile location
                  </p>
                </div>

                {/* QR Code for Printing */}
                <div className="bg-white p-8 rounded-lg flex items-center justify-center print:p-16">
                  <div className="text-center">
                    <QRCode value={scanUrl} size={256} />
                    <p className="mt-4 text-sm text-gray-600 font-medium">
                      Scan to Generate Energy
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handlePrint}
                    className="w-full"
                  >
                    <Printer className="mr-2 h-5 w-5" />
                    Print QR Code
                  </Button>
                  <Button
                    onClick={() => setShowQRCode(false)}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                </div>

                {/* Instructions */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Instructions:</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Print this QR code</li>
                    <li>Place it at your turnstile location</li>
                    <li>Users scan with their phone camera</li>
                    <li>Dashboard updates automatically</li>
                  </ol>
                </div>
              </div>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
};

export default Scanner;
