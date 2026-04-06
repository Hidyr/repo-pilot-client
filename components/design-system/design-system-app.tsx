"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  SlidersHorizontal,
  BookMarked,
  Wrench,
  ExternalLink,
  Rocket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SettingsGroup,
  SettingsRow,
  SettingsRowText,
} from "@/components/design-system/settings-group";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { RepopilotPanel } from "@/components/design-system/repopilot-panel";

const NAV_IDS = [
  "overview",
  "general",
  "rules",
  "tools",
  "repopilot",
] as const;

type NavId = (typeof NAV_IDS)[number];

const NAV: { id: NavId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Foundation", icon: LayoutGrid },
  { id: "general", label: "General", icon: SlidersHorizontal },
  { id: "rules", label: "Rules & skills", icon: BookMarked },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "repopilot", label: "RepoPilot (PRD)", icon: Rocket },
];

function NavItem({
  id,
  label,
  icon: Icon,
  active,
  onSelect,
}: {
  id: NavId;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onSelect: (id: NavId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        "flex w-full items-center gap-2 px-4 py-1.5 text-left text-[13px] transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-[#222222] hover:text-[#dddddd]"
      )}
    >
      <Icon
        className={cn(
          "size-3.5 shrink-0 opacity-70",
          active ? "text-[#cccccc]" : "text-[#777777]"
        )}
        strokeWidth={1.5}
      />
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 mt-6 text-[11px] text-muted-foreground first:mt-0">
      {children}
    </p>
  );
}

function OverviewPanel() {
  return (
    <div className="max-w-2xl space-y-2">
      <h1 className="mb-7 text-xl font-medium text-[#e8e8e8]">Foundation</h1>
      <p className="-mt-5 mb-6 max-w-lg text-[13px] text-muted-foreground">
        shadcn/ui mapped to the same tokens as{" "}
        <code className="text-[11px] text-[#aaaaaa]">public/design-system.css</code>
        . Use <code className="text-[11px] text-[#aaaaaa]">--primary</code> for light
        CTAs, <code className="text-[11px] text-[#aaaaaa]">chrome</code> buttons for
        secondary actions, and checkboxes for boolean settings. Open{" "}
        <strong className="font-medium text-[#ccc]">RepoPilot (PRD)</strong> in the
        sidebar for queue UI, status chips, tables, dialogs, and toasts.
      </p>

      <SectionLabel>Typography</SectionLabel>
      <SettingsGroup>
        <SettingsRow>
          <SettingsRowText title="Page title sample" description="text-xl · #e8e8e8" />
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText
            title="Section label"
            description="11px · muted-foreground"
          />
        </SettingsRow>
      </SettingsGroup>

      <SectionLabel>Buttons</SectionLabel>
      <SettingsGroup>
        <SettingsRow>
          <SettingsRowText
            title="Primary (light CTA)"
            description="variant default — matches + Add Doc / + New"
          />
          <Button size="sm">+ New</Button>
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText
            title="Chrome"
            description="variant chrome — bordered control surface"
          />
          <Button variant="chrome" size="sm">
            Open
          </Button>
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText title="Outline" description="Borders + transparent fill" />
          <Button variant="outline" size="sm">
            Cancel
          </Button>
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText title="Ghost" />
          <Button variant="ghost" size="sm">
            Dismiss
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SectionLabel>Badges & checkbox</SectionLabel>
      <SettingsGroup>
        <SettingsRow>
          <SettingsRowText
            title={
              <span>
                New feature{" "}
                <Badge
                  variant="secondary"
                  className="ml-1.5 border border-[#2a3a2a] bg-[#2a3a2a] text-[10px] font-normal text-[#5a9a5a]"
                >
                  NEW
                </Badge>
              </span>
            }
          />
          <Checkbox defaultChecked />
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText title="Unchecked" description="Off state" />
          <Checkbox />
        </SettingsRow>
      </SettingsGroup>

      <SectionLabel>Tabs (filter-style)</SectionLabel>
      <Card className="border-border bg-card py-4 ring-1 ring-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filter pills</CardTitle>
          <CardDescription>TabsList on muted rail, active tab lifted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList variant="default" className="h-9 rounded-lg bg-muted p-1">
              <TabsTrigger value="all" className="rounded-md px-3 text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="user" className="rounded-md px-3 text-xs">
                User
              </TabsTrigger>
              <TabsTrigger value="repo" className="rounded-md px-3 text-xs">
                repo-pilot-root
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-3 text-xs text-muted-foreground">
              Active tab uses background + foreground tokens.
            </TabsContent>
            <TabsContent value="user" className="mt-3 text-xs text-muted-foreground">
              User-scoped items.
            </TabsContent>
            <TabsContent value="repo" className="mt-3 text-xs text-muted-foreground">
              Workspace-scoped items.
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SectionLabel>Fields</SectionLabel>
      <SettingsGroup>
        <SettingsRow>
          <SettingsRowText title="With label" />
          <div className="w-48 space-y-1.5">
            <Label htmlFor="ds-demo" className="sr-only">
              Demo
            </Label>
            <Input id="ds-demo" placeholder="Search…" className="h-8 text-sm" />
          </div>
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText title="Select" description="Trigger matches control chrome" />
          <Select defaultValue="a">
            <SelectTrigger className="h-8 w-[140px] border-[#3e3e3e] bg-[#2a2a2a] text-[#bbbbbb] shadow-none">
              <SelectValue placeholder="Pick" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Breadcrumb</SelectItem>
              <SelectItem value="b">Floating</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}

function GeneralPanel() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-7 text-xl font-medium text-[#e8e8e8]">General</h1>

      <SettingsGroup className="mb-2">
        <SettingsRow>
          <SettingsRowText
            title="Cursor Account"
            description="Manage your account and billing"
          />
          <Button variant="chrome" size="sm" className="gap-1">
            Open <ExternalLink className="size-3" />
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SectionLabel>Preferences</SectionLabel>
      <SettingsGroup>
        <SettingsRow>
          <SettingsRowText
            title="Editor Settings"
            description="Configure font, formatting, minimap and more"
          />
          <Button variant="chrome" size="sm">
            Open
          </Button>
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText
            title="Keyboard Shortcuts"
            description="Configure keyboard shortcuts"
          />
          <Button variant="chrome" size="sm">
            Open
          </Button>
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText
            title="Import Settings from VS Code"
            description="Import settings, extensions, and keybindings from VS Code"
          />
          <Button variant="chrome" size="sm">
            Import
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SectionLabel>Layout</SectionLabel>
      <SettingsGroup>
        <SettingsRow>
          <SettingsRowText
            title="Title Bar"
            description="Show title bar in agent layout"
          />
          <Checkbox defaultChecked />
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText
            title="Status Bar"
            description="Show status bar at the bottom of the window"
          />
          <Checkbox defaultChecked />
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText
            title="Review Control Location"
            description="Show inline diff review controls in top level breadcrumbs or floating island"
          />
          <Select defaultValue="bc">
            <SelectTrigger className="h-8 w-[130px] border-[#3e3e3e] bg-[#2a2a2a] text-[#bbbbbb] shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bc">Breadcrumb</SelectItem>
              <SelectItem value="fl">Floating</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText
            title={
              <span>
                Open chat as editor tabs{" "}
                <Badge
                  variant="secondary"
                  className="ml-1.5 border border-[#2a3a2a] bg-[#2a3a2a] text-[10px] font-normal text-[#5a9a5a]"
                >
                  NEW
                </Badge>
              </span>
            }
            description="Show chats as editor tabs inside the chat area instead of the legacy stacked view"
          />
          <Checkbox />
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}

function RulesPanel() {
  const [scope, setScope] = React.useState<"all" | "user" | "repo">("all");

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-medium text-[#e8e8e8]">
        Rules, Skills, Subagents
      </h1>
      <p className="mb-5 max-w-lg text-[13px] text-muted-foreground">
        Provide domain-specific knowledge and workflows for the agent.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            { id: "all" as const, label: "All" },
            { id: "user" as const, label: "User" },
            { id: "repo" as const, label: "repo-pilot-root" },
          ]
        ).map((p) => (
          <Button
            key={p.id}
            type="button"
            size="sm"
            variant={scope === p.id ? "default" : "ghost"}
            className={cn(
              "h-8 rounded-full px-3.5 text-xs font-medium",
              scope === p.id
                ? "bg-[#d0d0d0] text-[#1a1a1a] hover:bg-[#d0d0d0]"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setScope(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <SettingsGroup className="mb-8">
        <SettingsRow>
          <SettingsRowText
            titleClassName="font-medium text-[#e8e8e8]"
            title="Include third-party Plugins, Skills, and other configs"
            description="Automatically import agent configs from other tools"
          />
          <Checkbox defaultChecked />
        </SettingsRow>
      </SettingsGroup>

      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center text-sm font-medium text-[#e8e8e8]">
          Rules
          <span
            className="ml-1.5 flex size-3.5 items-center justify-center rounded-full border border-muted-foreground text-[9px] font-normal text-muted-foreground"
            title="Info"
          >
            i
          </span>
        </div>
        <Button size="sm" className="h-8">
          + New
        </Button>
      </div>
      <p className="mb-3 text-[13px] text-muted-foreground">
        Create rules to scope edits, add context, or enforce style.
      </p>
      <div className="mb-8 rounded-xl border border-border bg-card px-6 py-10 text-center ring-1 ring-white/5">
        <p className="text-sm font-medium text-[#e8e8e8]">No Rules Yet</p>
        <p className="mx-auto mt-2 max-w-xs text-[13px] text-muted-foreground">
          Create rules to guide Agent behavior.
        </p>
        <Button variant="outline" size="sm" className="mt-5">
          New User Rule
        </Button>
      </div>

      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center text-sm font-medium text-[#e8e8e8]">
          Skills
          <span className="ml-1.5 flex size-3.5 items-center justify-center rounded-full border border-muted-foreground text-[9px] font-normal text-muted-foreground">
            i
          </span>
        </div>
        <Button size="sm" className="h-8">
          + New
        </Button>
      </div>
      <p className="mb-3 text-[13px] text-muted-foreground">
        Teach the Agent new capabilities with composable instructions.
      </p>
      <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-white/5">
        <p className="text-sm font-medium text-[#e8e8e8]">find-skills</p>
        <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-muted-foreground">
          Helps users discover and install agent skills when they ask how to do X, find
          a skill for Y, or want to extend capabilities. Use when the user wants to add
          skills, browse capabilities, or asks what skills exist…
        </p>
      </div>
    </div>
  );
}

function ToolsPanel() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-7 text-xl font-medium text-[#e8e8e8]">Tools</h1>

      <SectionLabel>Browser</SectionLabel>
      <SettingsGroup>
        <SettingsRow>
          <SettingsRowText
            titleClassName="font-medium text-[#e8e8e8]"
            title="Browser Automation"
            description="Browser automation disabled"
          />
          <Select defaultValue="off">
            <SelectTrigger className="h-8 w-[100px] border-[#3e3e3e] bg-[#2a2a2a] text-[#bbbbbb] shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off</SelectItem>
              <SelectItem value="on">On</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow>
          <SettingsRowText
            titleClassName="font-medium text-[#e8e8e8]"
            title="Show Localhost Links in Browser"
            description="Automatically open localhost links in the Browser Tab"
          />
          <Checkbox defaultChecked />
        </SettingsRow>
      </SettingsGroup>

      <SectionLabel>Installed MCP Servers</SectionLabel>
      <SettingsGroup>
        <SettingsRow>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative shrink-0">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#2a2a2a] text-sm font-semibold text-muted-foreground">
                P
              </div>
              <span
                className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card bg-[#30d158]"
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#e8e8e8]">pencil</p>
              <button
                type="button"
                className="mt-0.5 flex items-center gap-0.5 text-[13px] text-muted-foreground hover:text-foreground"
              >
                13 tools enabled
                <span className="text-[10px] opacity-70">▼</span>
              </button>
            </div>
          </div>
          <Checkbox defaultChecked />
        </SettingsRow>
        <SettingsRow>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#2a2a2a] text-lg font-normal text-muted-foreground">
              +
            </div>
            <SettingsRowText
              titleClassName="font-medium text-[#e8e8e8]"
              title="New MCP Server"
              description="Add a Custom MCP Server"
            />
          </div>
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}

export function DesignSystemApp() {
  const [active, setActive] = React.useState<NavId>("overview");

  React.useEffect(() => {
    const raw = window.location.hash.replace(/^#/, "");
    if (raw && NAV_IDS.includes(raw as NavId)) {
      setActive(raw as NavId);
    }
  }, []);

  const selectNav = React.useCallback((id: NavId) => {
    setActive(id);
    const path = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", id === "overview" ? path : `${path}#${id}`);
  }, []);

  return (
    <div className="flex h-dvh max-h-dvh flex-1 overflow-hidden rounded-xl bg-background text-[13px]">
      <aside className="flex w-[230px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-4">
        <div className="border-b border-[#2a2a2a] px-4 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#444444] text-[11px] font-medium text-[#cccccc]">
              R
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-[#aaaaaa]">repo-pilot@…</p>
              <p className="text-[11px] text-muted-foreground">Pro Plan</p>
            </div>
          </div>
        </div>
        <div className="mx-2.5 mt-3 mb-3">
          <Input
            readOnly
            placeholder="Search settings ⌘F"
            className="h-8 cursor-default border-[#333333] bg-[#222222] text-xs text-muted-foreground shadow-none"
          />
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavItem
              key={item.id}
              {...item}
              active={active === item.id}
              onSelect={selectNav}
            />
          ))}
        </nav>
        <Separator className="my-3 bg-sidebar-border" />
        <div className="px-3">
          <Link
            href="/design-system.html"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 w-full justify-start gap-2 text-xs text-muted-foreground no-underline hover:no-underline"
            )}
          >
            <ExternalLink className="size-3.5" />
            Full HTML reference
          </Link>
        </div>
      </aside>

      <ScrollArea className="h-full min-h-0 min-w-0 flex-1">
        <main className="px-10 py-8">
          {active === "overview" ? <OverviewPanel /> : null}
          {active === "general" ? <GeneralPanel /> : null}
          {active === "rules" ? <RulesPanel /> : null}
          {active === "tools" ? <ToolsPanel /> : null}
          {active === "repopilot" ? <RepopilotPanel /> : null}
        </main>
      </ScrollArea>
    </div>
  );
}
