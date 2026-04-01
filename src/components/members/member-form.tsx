"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, ExternalLink, Copy } from "lucide-react";
import { registerMember } from "@/app/admin/members/actions";
import type { MemberActionState } from "@/app/admin/members/actions";

const MEMBERSHIP_TYPES = [
  { value: "adult", label: "Adult — £50" },
  { value: "youth", label: "Youth — £25" },
  { value: "student", label: "Student — £30" },
  { value: "family", label: "Family — £100" },
  { value: "social", label: "Social — £20" },
];

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const messages = errors?.[field];
  if (!messages?.length) return null;
  return <p className="text-xs text-destructive">{messages[0]}</p>;
}

export function MemberForm() {
  const [state, formAction, isPending] = useActionState<MemberActionState, FormData>(
    registerMember,
    {}
  );
  const [membershipType, setMembershipType] = useState("");

  // If we got a checkout URL, show the payment link
  if (state.checkoutUrl) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link href="/admin/members" />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Member Registered</h1>
            <p className="text-sm text-muted-foreground">
              Share the payment link to complete registration.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border/50 bg-card p-6">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-medium text-emerald-400">
              Member created successfully!
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Their status is &quot;pending&quot; until payment is received.
            </p>
          </div>

          <div>
            <Label>Payment Link</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input readOnly value={state.checkoutUrl} className="flex-1 text-xs" />
              <Button
                size="sm"
                onClick={() => window.open(state.checkoutUrl, "_blank")}
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(state.checkoutUrl!)}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" render={<Link href="/admin/members" />}>
              Back to Members
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" render={<Link href="/admin/members" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Register Member</h1>
          <p className="text-sm text-muted-foreground">
            Add a new member to your organisation.
          </p>
        </div>
      </div>

      {/* Error banner */}
      {state.message && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      {/* Form */}
      <form
        action={formAction}
        className="space-y-5 rounded-xl border border-border/50 bg-card p-6"
      >
        <input type="hidden" name="membership_type" value={membershipType} />

        {/* Name */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" name="first_name" required />
            <FieldError errors={state.errors} field="first_name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" name="last_name" required />
            <FieldError errors={state.errors} field="last_name" />
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
            <FieldError errors={state.errors} field="email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="+44 7700 900000"
              required
            />
            <FieldError errors={state.errors} field="phone_number" />
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of birth</Label>
            <Input id="date_of_birth" name="date_of_birth" type="date" />
          </div>

          <div className="space-y-2">
            <Label>Membership type</Label>
            <Select
              value={membershipType}
              onValueChange={(val) => setMembershipType(val as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                {MEMBERSHIP_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={state.errors} field="membership_type" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" render={<Link href="/admin/members" />}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register Member
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          If Stripe is connected, a payment link will be generated after registration.
          The member&apos;s status will remain &quot;pending&quot; until payment is received.
        </p>
      </form>
    </div>
  );
}
