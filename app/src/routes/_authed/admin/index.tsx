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
  optional?: boolean;
}[] = [
  {
    key: "intelligence",
    title: "Intelligence",
    description: "Durable threads, memory and realtime runtime.",
  },
  {
    key: "managedAgent",
    title: "Bundled AI runtime",
    description: "A locally managed or picked agent harness is configured.",
  },
  {
    key: "computer",
    title: "Bot computers",
    description: "Browser, workspace and computer-use runtime.",
    optional: true,
  },
  {
    key: "routines",
    title: "Scheduled routines",
    description: "Worker handoff is configured for recurring work.",
    optional: true,
  },
  {
    key: "toolGateway",
    title: "Agent tool gateway",
    description: "Framework agents can call governed tools back through OpenBot.",
    optional: true,
  },
  {
    key: "composio",
    title: "Composio apps",
    description: "Brokered third-party app connections are enabled.",
    optional: true,
  },
  {
    key: "transcription",
    title: "Voice dictation",
    description: "Speech-to-text provider is configured.",
    optional: true,
  },
  {
    key: "voice",
    title: "Live voice",
    description: "Realtime voice provider is configured.",
    optional: true,
  },
  {
    key: "handoffs",
    title: "Bot handoffs",
    description: "Coworkers may delegate work to other coworkers.",
    optional: true,
  },
  {
    key: "publicCallbacks",
    title: "Public callbacks",
    description: "A public URL exists for OAuth and external callbacks.",
    optional: true,
  },
  {
    key: "authentication",
    title: "Access control",
    description: "Local single-user access or an identity provider is configured.",
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
      description="Configuration state reported by the running server. Optional services stay visible when they are off, so missing setup is obvious instead of becoming a mystery later."
      title="Deployment health"
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
              <Item size="sm">
                <ItemMedia>
                  <span className="w-20 text-xs font-medium text-muted-foreground">
                    {status}
                  </span>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>{item.description}</ItemDescription>
                </ItemContent>
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
