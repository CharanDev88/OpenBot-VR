import {
  IconBuildingBank,
  IconChevronRight,
  IconCode,
  IconDeviceDesktop,
  IconFileText,
  IconKey,
  IconLayoutGrid,
  IconListDetails,
  IconPuzzle,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import {
  createFileRoute,
  Link,
  type LinkOptions,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  PageRows,
  PageSection,
  PageShell,
} from "@/components/layout/page-shell";
import { StaggerItem } from "@/components/layout/stagger";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authed/admin/")({
  component: RouteComponent,
});

/**
 * Grouped by what the decision is about rather than by how the code is organised.
 *
 * "What Bots can reach" is the group an administrator arrives worrying about, so it goes first.
 * Everything in it either grants a capability or fences one in.
 */
const SECTIONS: {
  title: string;
  description: string;
  items: {
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    linkOptions: LinkOptions;
    title: string;
  }[];
}[] = [
  {
    title: "What Bots can reach",
    description:
      "Everything a Bot can touch outside this app, and the limits on it.",
    items: [
      {
        title: "Credentials",
        description: "Keys and tokens held for this deployment.",
        icon: IconKey,
        linkOptions: { to: "/admin/credentials" },
      },
      {
        title: "Boundaries",
        description: "Rules that decide what a Bot may never do.",
        icon: IconShieldCheck,
        linkOptions: { to: "/admin/boundaries" },
      },
      {
        title: "Computers",
        description: "The machines Bots run their tools on.",
        icon: IconDeviceDesktop,
        linkOptions: { to: "/admin/computers" },
      },
    ],
  },
  {
    title: "What Bots can do",
    description: "Capabilities and interface pieces available across Bots.",
    items: [
      {
        title: "Plugins",
        description:
          "The services this deployment can reach, and which Bots may.",
        icon: IconPuzzle,
        linkOptions: { to: "/admin/plugins" },
      },
      {
        title: "Skills",
        description: "Named instructions anybody can invoke with a slash.",
        icon: IconFileText,
        linkOptions: { to: "/admin/skills" },
      },
      {
        title: "Automatic Learning",
        description:
          "Learn from completed conversations and review proposed skills.",
        icon: IconFileText,
        linkOptions: { to: "/admin/learning" },
      },
      {
        title: "UI Components",
        description: "Custom pieces a Bot can draw in a conversation.",
        icon: IconLayoutGrid,
        linkOptions: { to: "/admin/components" },
      },
      {
        title: "Playground",
        description: "Write a component and watch it render as you type.",
        icon: IconCode,
        linkOptions: { to: "/admin/playground" },
      },
    ],
  },
  {
    title: "Who can get in",
    description: "",
    items: [
      {
        title: "People",
        description:
          "Everybody who has signed in, who administers this deployment, and whose access has been removed.",
        icon: IconUsers,
        linkOptions: { to: "/admin/people" },
      },
      {
        title: "Enterprise controls",
        description:
          "Capabilities by role and group, SSO required, SCIM, network policy, MCP and model allowlists, Action Recording.",
        icon: IconShieldCheck,
        linkOptions: { to: "/admin/enterprise" },
      },
      {
        title: "Identity providers",
        description:
          "A company's own SAML or OpenID Connect provider, routed by email domain.",
        icon: IconBuildingBank,
        linkOptions: { to: "/admin/identity-providers" },
      },
    ],
  },
  {
    title: "What happened",
    description: "",
    items: [
      {
        title: "Audit",
        description: "Every action taken in this deployment, and by whom.",
        icon: IconListDetails,
        linkOptions: { to: "/admin/audit" },
      },
    ],
  },
];

type DeploymentReadiness = {
  intelligence: boolean;
  managedAgent: boolean;
  computer: boolean;
  routines: boolean;
  toolGateway: boolean;
  composio: boolean;
  transcription: boolean;
  voice: boolean;
  handoffs: boolean;
  publicCallbacks: boolean;
  authentication: boolean;
};

const HEALTH_ROWS: {
  key: keyof DeploymentReadiness;
  title: string;
  description: string;
  setup: string;
  optional?: boolean;
  linkOptions?: LinkOptions;
  linkLabel?: string;
}[] = [
  {
    key: "intelligence",
    title: "Intelligence",
    description: "Durable threads, memory and realtime runtime.",
    setup:
      "Required at boot: INTELLIGENCE_API_URL, INTELLIGENCE_GATEWAY_WS_URL and INTELLIGENCE_API_KEY.",
  },
  {
    key: "managedAgent",
    title: "Bundled AI runtime",
    description: "A locally managed or picked agent harness is configured.",
    setup:
      "Desktop setup can install/pick a harness. Server deployments use MANAGED_AGENT_AG_UI_URL with MANAGED_AGENT_TOKEN.",
  },
  {
    key: "computer",
    title: "Bot computers",
    description: "Browser, workspace and computer-use runtime.",
    setup:
      "Configure COMPUTER_SUPERVISOR_URL, AGENT_COMPUTER_URL or COMPUTER_SANDBOX_NAMESPACE; protect it with COMPUTER_TOKEN.",
    optional: true,
    linkOptions: { to: "/admin/computers" },
    linkLabel: "Computers",
  },
  {
    key: "routines",
    title: "Scheduled routines",
    description: "Worker handoff is configured for recurring work.",
    setup:
      "Run the worker and set WORKER_SHARED_SECRET on both sides. This status reports the server-side handoff secret.",
    optional: true,
  },
  {
    key: "toolGateway",
    title: "Agent tool gateway",
    description:
      "Framework agents can call governed tools back through OpenBot.",
    setup:
      "Set AGENT_TOOL_TOKEN on the server and the managed framework agent so tool calls return through policy and audit.",
    optional: true,
  },
  {
    key: "composio",
    title: "Composio apps",
    description: "Brokered third-party app connections are enabled.",
    setup:
      "Set COMPOSIO_API_KEY to enable the brokered app catalogue. Built-in Drive, Notion and Parallel connectors do not depend on Composio.",
    optional: true,
    linkOptions: { to: "/admin/plugins" },
    linkLabel: "Plugins",
  },
  {
    key: "transcription",
    title: "Voice dictation",
    description: "Speech-to-text provider is configured.",
    setup:
      "Set TRANSCRIPTION_PROVIDER, TRANSCRIPTION_BASE_URL and TRANSCRIPTION_MODEL. TRANSCRIPTION_API_KEY is optional for a no-auth local endpoint.",
    optional: true,
  },
  {
    key: "voice",
    title: "Live voice",
    description: "Realtime voice provider is configured.",
    setup:
      "Set VOICE_PROVIDER and that provider's realtime model/key settings. Voice is independent of the normal chat model.",
    optional: true,
  },
  {
    key: "handoffs",
    title: "Bot handoffs",
    description: "Coworkers may delegate work to other coworkers.",
    setup:
      "Controlled by BOT_HANDOFF_MAX_DEPTH and BOT_HANDOFF_MAX_PER_RUN. Set either to 0 to disable delegation.",
    optional: true,
  },
  {
    key: "publicCallbacks",
    title: "Public callbacks",
    description: "A public URL exists for OAuth and external callbacks.",
    setup:
      "Set OPENBOT_PUBLIC_URL for deployed OAuth/webhook callbacks. BETTER_AUTH_URL can also supply the public API origin.",
    optional: true,
  },
  {
    key: "authentication",
    title: "Access control",
    description:
      "Local single-user access or an identity provider is configured.",
    setup:
      "Use OPENBOT_SINGLE_USER=true only for local/private use, or configure Google, Microsoft, Okta, SAML or OIDC for multi-user deployments.",
    linkOptions: { to: "/admin/identity-providers" },
    linkLabel: "Identity",
  },
];

function DeploymentHealth() {
  const [readiness, setReadiness] = useState<DeploymentReadiness | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/capabilities", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`capabilities returned ${response.status}`);
        }
        return (await response.json()) as { readiness?: DeploymentReadiness };
      })
      .then((capabilities) => {
        setReadiness(capabilities.readiness ?? null);
        setFailed(!capabilities.readiness);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFailed(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <PageSection
      description="Configuration presence reported by the running server — not a live connectivity test. A Ready row means the required configuration is present; service reachability is still verified when that feature is actually used."
      title="Setup & configuration health"
    >
      <PageRows>
        {HEALTH_ROWS.map((item, index) => {
          const ready = readiness?.[item.key] === true;
          const status = failed
            ? "Unavailable"
            : readiness === null
              ? "Checking…"
              : ready
                ? "Ready"
                : item.optional
                  ? "Optional · off"
                  : "Needs setup";
          return (
            <StaggerItem index={index} key={item.key}>
              <Item
                render={
                  item.linkOptions
                    ? (props) => <Link {...item.linkOptions} {...props} />
                    : undefined
                }
                size="sm"
              >
                <ItemMedia>
                  <span className="w-20 text-xs font-medium text-muted-foreground">
                    {status}
                  </span>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>
                    {item.description}
                    {!ready && readiness !== null && !failed ? (
                      <span className="mt-1 block">Setup: {item.setup}</span>
                    ) : null}
                  </ItemDescription>
                </ItemContent>
                {item.linkOptions ? (
                  <ItemActions>
                    <span className="text-muted-foreground text-xs">
                      {item.linkLabel}
                    </span>
                    <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </ItemActions>
                ) : null}
              </Item>
              {index !== HEALTH_ROWS.length - 1 && <Separator />}
            </StaggerItem>
          );
        })}
      </PageRows>
    </PageSection>
  );
}

function RouteComponent() {
  return (
    <PageShell
      description="Settings that apply to everybody in this deployment. Anything here affects every person and every Bot, which is what separates it from your own preferences."
      title="Admin"
    >
      <DeploymentHealth />
      {SECTIONS.map((section) => (
        <PageSection
          description={section.description || undefined}
          key={section.title}
          title={section.title}
        >
          <PageRows>
            {section.items.map((item, index) => (
              <StaggerItem index={index} key={item.title}>
                {/*
                 * The whole row is the link, not a chevron somebody has to aim at: every row here
                 * goes exactly one place, so there is nothing else the row could mean.
                 */}
                <Item
                  render={(props) => <Link {...item.linkOptions} {...props} />}
                  size="sm"
                >
                  <ItemMedia>
                    <item.icon className="size-4 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{item.title}</ItemTitle>
                    <ItemDescription>{item.description}</ItemDescription>
                  </ItemContent>
                  <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Item>
                {index !== section.items.length - 1 && <Separator />}
              </StaggerItem>
            ))}
          </PageRows>
        </PageSection>
      ))}
    </PageShell>
  );
}
