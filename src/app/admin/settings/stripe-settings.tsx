"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
} from "lucide-react";
import {
  setupStripeConnect,
  resumeStripeOnboarding,
  initializeMembershipProducts,
  getStripeDashboardUrl,
} from "./actions";

interface StripeSettingsProps {
  isConnected: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  hasPriceMap: boolean;
}

function StepIndicator({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
      ) : (
        <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
      )}
      <span className={done ? "text-sm text-foreground" : "text-sm text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

export function StripeSettings({
  isConnected,
  chargesEnabled,
  detailsSubmitted,
  hasPriceMap,
}: StripeSettingsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSetup() {
    setError(null);
    startTransition(async () => {
      const result = await setupStripeConnect();
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  function handleResumeOnboarding() {
    setError(null);
    startTransition(async () => {
      const result = await resumeStripeOnboarding();
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  function handleCreateProducts() {
    setError(null);
    startTransition(async () => {
      const result = await initializeMembershipProducts();
      if (result.error) {
        setError(result.error);
      }
    });
  }

  function handleOpenDashboard() {
    setError(null);
    startTransition(async () => {
      const result = await getStripeDashboardUrl();
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        window.open(result.url, "_blank");
      }
    });
  }

  const allComplete = isConnected && chargesEnabled && hasPriceMap;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <CreditCard className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <CardTitle>Stripe Connect</CardTitle>
              <CardDescription>
                Accept membership payments with automatic 10% platform fee
              </CardDescription>
            </div>
          </div>
          {allComplete && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Setup steps */}
        <div className="space-y-3">
          <StepIndicator done={isConnected} label="Stripe account created" />
          <StepIndicator done={detailsSubmitted} label="Onboarding completed" />
          <StepIndicator done={chargesEnabled} label="Payments enabled" />
          <StepIndicator done={hasPriceMap} label="Membership products created" />
        </div>

        {/* Error display */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {!isConnected && (
            <Button onClick={handleSetup} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Connect Stripe
            </Button>
          )}

          {isConnected && !detailsSubmitted && (
            <Button onClick={handleResumeOnboarding} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Complete Onboarding
            </Button>
          )}

          {isConnected && chargesEnabled && !hasPriceMap && (
            <Button onClick={handleCreateProducts} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Package className="mr-2 h-4 w-4" />
              )}
              Create Membership Products
            </Button>
          )}

          {isConnected && chargesEnabled && (
            <Button variant="outline" onClick={handleOpenDashboard} disabled={isPending}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Stripe Dashboard
            </Button>
          )}
        </div>

        {/* Info text */}
        {allComplete && (
          <p className="text-xs text-muted-foreground">
            Stripe is fully configured. Membership payments will be processed with a 10% platform
            fee automatically deducted. You can manage pricing and payouts from the Stripe
            Dashboard.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
