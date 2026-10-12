import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/shell/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import {
  Rocket,
  Flame,
  Zap,
  Radar,
  Link2,
  ArrowRightLeft,
  Layers,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Vision — HAMR.fun",
  description:
    "Why HAMR exists, how $HAMR captures protocol revenue, and the road from Solana to GIWA. The only launchpad that does not lock you to one chain.",
};

// /vision — the HAMR narrative in one place.
//
//   01  Why HAMR        — X attention → one click → live on Pump.fun
//   02  $HAMR           — 75% of protocol revenue buys back and burns $HAMR
//   03  Roadmap         — Phase 1 Solana → Phase 2 GIWA + opt-in migration
//
// Anchored sections so X posts can deep-link (#tokenomics, #roadmap).

const SECTIONS = [
  { id: "why", label: "Why HAMR" },
  { id: "tokenomics", label: "$HAMR" },
  { id: "roadmap", label: "Roadmap" },
];

const WHY = [
  {
    icon: Radar,
    title: "Memes are born on X",
    body: "Every memecoin that mattered started as a post. HAMR watches X in real time through Grok and surfaces the signal before it becomes a chart.",
  },
  {
    icon: Zap,
    title: "One click from signal to token",
    body: "Concept, ticker, logo, launch posts, Pump.fun metadata and the unsigned create transaction, all drafted by the agent in a single run.",
  },
  {
    icon: Lock,
    title: "Your wallet signs. Always.",
    body: "HAMR never holds keys, never asks for a seed phrase, never moves funds. The agent prepares. You decide. Phantom or Solflare signs.",
  },
];

const ROADMAP = [
  {
    phase: "Phase 1",
    status: "LIVE",
    title: "Solana · Pump.fun",
    icon: Rocket,
    points: [
      "Auto-pilot: viral X post → launch kit → Pump.fun in one click",
      "Live Meme Radar and Grok launch kits",
      "Public board of every HAMR launch with live Pump.fun market data",
      "$HAMR buyback and burn funded by protocol revenue",
    ],
  },
  {
    phase: "Phase 2",
    status: "NEXT",
    title: "GIWA Chain launchpad",
    icon: Layers,
    points: [
      "HAMR.fun will be the FASTEST to add GIWA, the Upbit backed OP Stack L2",
      "Self hosted launchpad: every launch is a real DEX pool from block one, liquidity locked forever",
      "Creator fee share on every trade, protocol share flows to $HAMR buyback and burn",
      "Same agent, same one click flow, new chain",
    ],
  },
  {
    phase: "Phase 3",
    status: "PLANNED",
    title: "Opt-in cross-chain migration",
    icon: ArrowRightLeft,
    points: [
      "Creators choose whether their Solana token opens a GIWA edition",
      "Holders burn on Solana, receive the same amount on GIWA, total supply preserved",
      "Fresh GIWA liquidity bootstrapped with incentives, nothing forced, nothing bridged custodially",
      "The only launchpad that does not lock you to one chain",
    ],
  },
];

export default function VisionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Vision"
        title="Attention in. Token out. Any chain."
        description="HAMR turns what X is already talking about into a live token in one click, and routes the revenue that creates back into $HAMR. Here is the whole story."
        breadcrumbs={[{ href: "/", label: "HAMR" }, { label: "Vision" }]}
        actions={
          <ButtonLink href="/launch">
            <Rocket className="h-4 w-4" />
            Launch a memecoin
          </ButtonLink>
        }
      />

      {/* Sticky in-page nav */}
      <div className="sticky top-20 z-30 border-b border-[var(--border)] bg-bg/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-12 flex items-center gap-1 overflow-x-auto">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 text-[12px] font-extrabold tracking-tight text-ink-300/70 hover:text-ink-300 rounded-md hover:bg-ink-1000/10 transition-colors whitespace-nowrap"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* 01 — Why HAMR */}
      <section id="why" className="scroll-mt-32 border-b border-[var(--border)] bg-bg">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="max-w-3xl">
            <div className="eyebrow">01 · Why HAMR</div>
            <h2 className="mt-3 text-display text-display-md text-balance">
              Most launch tools wait for an idea.{" "}
              <span className="stamp">HAMR</span> watches first.
            </h2>
            <p className="mt-5 text-ink-300/80 text-base md:text-lg leading-relaxed font-medium text-balance">
              The gap between a viral post and a tradable token is where
              memecoins are won or lost. HAMR collapses that gap to one
              signature: the agent reads X, drafts the whole launch, and hands
              you an unsigned Pump.fun transaction. Nothing ships until your
              wallet says so.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {WHY.map((w, i) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className="card !p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-full border border-[var(--border-strong)] bg-koki-500 flex items-center justify-center text-ink-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="eyebrow !text-[10px] opacity-60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-5 text-[18px] font-black tracking-tight text-ink-300">
                    {w.title}
                  </div>
                  <p className="mt-1.5 text-[13px] text-ink-300/72 leading-snug font-medium">
                    {w.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 02 — $HAMR tokenomics */}
      <section id="tokenomics" className="scroll-mt-32 border-b border-[var(--border)] bg-bg-elevated">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="max-w-3xl">
            <div className="eyebrow">02 · $HAMR</div>
            <h2 className="mt-3 text-display text-display-md text-balance">
              Every launch feeds the <span className="stamp">burn</span>.
            </h2>
            <p className="mt-5 text-ink-300/80 text-base md:text-lg leading-relaxed font-medium text-balance">
              $HAMR is the native token of the HAMR launchpad. Protocol revenue
              from launches and trading fees is split by a fixed rule, and the
              largest share goes straight to buying $HAMR on the open market
              and burning it. More launches, less supply.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-3 card !p-6 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-[var(--border-strong)] bg-koki-500 flex items-center justify-center text-ink-300">
                  <Flame className="h-4 w-4" />
                </div>
                <span className="eyebrow !text-[10px]">Buyback &amp; burn</span>
              </div>
              <div className="mt-6 text-display text-[56px] md:text-[72px] leading-none font-black tracking-tightest text-ink-300">
                75%
              </div>
              <p className="mt-3 text-[14px] text-ink-300/75 leading-relaxed font-medium max-w-md">
                of all protocol revenue buys $HAMR on the market and sends it
                to the burn address. Permanent, verifiable on chain, no
                discretion.
              </p>
            </div>
            <div className="md:col-span-2 card !p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-[var(--border-strong)] bg-ink-1000/10 flex items-center justify-center text-ink-300">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="eyebrow !text-[10px]">Team &amp; operations</span>
              </div>
              <div className="mt-6 text-display text-[56px] md:text-[72px] leading-none font-black tracking-tightest text-ink-300/60">
                25%
              </div>
              <p className="mt-3 text-[14px] text-ink-300/75 leading-relaxed font-medium">
                funds the agent infrastructure, Grok and RPC costs, and the
                team building the next chain.
              </p>
            </div>
          </div>

          {/* Revenue bar */}
          <div className="mt-6 card !p-5">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-ink-300/60">
              <span>Protocol revenue split</span>
              <span>Fixed · on chain</span>
            </div>
            <div className="mt-3 h-3 w-full rounded-full overflow-hidden flex border border-[var(--border)]">
              <div className="h-full bg-koki-500" style={{ width: "75%" }} />
              <div className="h-full bg-ink-1000/20" style={{ width: "25%" }} />
            </div>
            <div className="mt-2 flex justify-between text-[12px] font-bold text-ink-300/70">
              <span>🔥 75% $HAMR buyback &amp; burn</span>
              <span>25% team / ops</span>
            </div>
          </div>

          <div className="mt-6 surface-ink p-6 text-[14px] leading-relaxed font-medium">
            <span className="font-extrabold">Where revenue comes from:</span>{" "}
            launch fees on every token shipped through HAMR, and, on the
            self hosted launchpad (Phase 2), the protocol share of every
            trade in every pool HAMR creates. Creators keep the majority of
            their trading fees; the protocol share is what feeds the burn.
          </div>
        </div>
      </section>

      {/* 03 — Roadmap */}
      <section id="roadmap" className="scroll-mt-32 border-b border-[var(--border)] bg-bg">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="max-w-3xl">
            <div className="eyebrow">03 · Roadmap</div>
            <h2 className="mt-3 text-display text-display-md text-balance">
              Solana first. <span className="stamp">GIWA</span> next. Never locked in.
            </h2>
            <p className="mt-5 text-ink-300/80 text-base md:text-lg leading-relaxed font-medium text-balance">
              Pump.fun is where the firepower is today, so that is where HAMR
              launches today. When GIWA mainnet goes live, HAMR.fun will be
              the fastest launchpad to deploy there, and every creator gets a
              choice: stay on Solana, open a GIWA edition, or both.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {ROADMAP.map((r) => {
              const Icon = r.icon;
              const live = r.status === "LIVE";
              return (
                <div key={r.phase} className="card !p-5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div
                      className={`h-10 w-10 rounded-full border border-[var(--border-strong)] flex items-center justify-center text-ink-300 ${
                        live ? "bg-koki-500" : "bg-ink-1000/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        live
                          ? "bg-emerald-500/15 text-emerald-400"
                          : r.status === "NEXT"
                            ? "bg-koki-500/15 text-koki-300"
                            : "bg-ink-1000/10 text-ink-300/60"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-5 eyebrow !text-[10px] opacity-60">{r.phase}</div>
                  <div className="mt-1 text-[18px] font-black tracking-tight text-ink-300">
                    {r.title}
                  </div>
                  <ul className="mt-4 space-y-2">
                    {r.points.map((p) => (
                      <li
                        key={p}
                        className="flex gap-2 text-[13px] text-ink-300/72 leading-snug font-medium"
                      >
                        <span className="text-koki-400 shrink-0">●</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-10 card !p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full border border-[var(--border-strong)] bg-koki-500 flex items-center justify-center text-ink-300">
                <Link2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[16px] font-black tracking-tight text-ink-300">
                  How migration works (opt-in, never forced)
                </div>
                <p className="mt-1 text-[13px] text-ink-300/72 leading-snug font-medium max-w-2xl">
                  A creator opts their token in. Holders burn on Solana with
                  their GIWA address attached. A verifier confirms the burn and
                  the GIWA contract mints the identical amount. Total supply
                  across both chains stays exactly the same, and new GIWA
                  liquidity forms fresh. No custodial bridge, no wrapped token.
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <ButtonLink href="/launch">
                <Rocket className="h-4 w-4" />
                Launch now
              </ButtonLink>
              <Link href="/launches" className="btn btn-secondary">
                See launches
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
