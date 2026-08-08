import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function nextWednesdayAt(hour: number, minute = 0): Date {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay();
  const daysUntilWed = (3 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilWed);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  await db.followUp.deleteMany();
  await db.metric.deleteMany();
  await db.draft.deleteMany();
  await db.runOfShowItem.deleteMany();
  await db.task.deleteMany();
  await db.event.deleteMany();
  await db.contact.deleteMany();
  await db.partner.deleteMany();
  await db.workspaceMember.deleteMany();
  await db.workspace.deleteMany();

  const workspace = await db.workspace.create({
    data: {
      name: "Hack Club",
      slug: "hack-club",
      members: {
        create: [
          {
            email: "president@club.example",
            name: "Alex Chen",
            role: "OWNER",
          },
          {
            email: "ops@club.example",
            name: "Jordan Lee",
            role: "OFFICER",
          },
        ],
      },
      partners: {
        create: [
          {
            name: "Campus Makerspace",
            org: "Student Life",
            notes: "Hosts build nights — confirm room booking 1 week ahead.",
            contacts: {
              create: {
                name: "Sam Rivera",
                email: "makerspace@campus.example",
                role: "Coordinator",
              },
            },
          },
        ],
      },
    },
  });

  const eventStart = nextWednesdayAt(18, 0);
  const eventEnd = new Date(eventStart);
  eventEnd.setHours(21, 0);

  const event = await db.event.create({
    data: {
      workspaceId: workspace.id,
      title: "Build Night: Repo Rescue",
      brief: `Weekly hands-on session where members bring stuck projects, broken repos, or half-finished ideas. Officers pair newcomers with mentors, run a 10-minute kickoff, then open floor for debugging and demos.

Goals:
- Help 3+ members unblock a PR or local dev setup
- Recruit 2 volunteers for next month's workshop
- Collect feedback on our onboarding docs`,
      startsAt: eventStart,
      endsAt: eventEnd,
      location: "Makerspace Room B",
      status: "CONFIRMED",
      tasks: {
        create: [
          {
            title: "Confirm room booking with Makerspace",
            assignee: "jordan",
            status: "DONE",
            sortOrder: 0,
          },
          {
            title: "Post #build-night reminder in club Slack",
            assignee: "alex",
            status: "IN_PROGRESS",
            sortOrder: 1,
          },
          {
            title: "Prepare mentor signup sheet",
            assignee: "jordan",
            status: "TODO",
            sortOrder: 2,
          },
          {
            title: "Stock snacks and name tags",
            assignee: "alex",
            status: "TODO",
            sortOrder: 3,
          },
        ],
      },
      runOfShow: {
        create: [
          { time: "6:00 PM", title: "Doors open, sign-in", sortOrder: 0 },
          {
            time: "6:10 PM",
            title: "Kickoff: format + safety",
            notes: "5 min welcome, 5 min how repo rescue works",
            sortOrder: 1,
          },
          {
            time: "6:20 PM",
            title: "Breakout: pairing & debugging",
            durationMin: 110,
            sortOrder: 2,
          },
          {
            time: "8:10 PM",
            title: "Lightning demos",
            notes: "2 min per team, optional",
            sortOrder: 3,
          },
          { time: "8:45 PM", title: "Cleanup + retro sticky notes", sortOrder: 4 },
        ],
      },
    },
  });

  await db.draft.create({
    data: {
      workspaceId: workspace.id,
      eventId: event.id,
      channel: "SLACK",
      body: `Hey #general — Build Night is this Wed 6–9pm in Makerspace Room B! Bring a repo you're stuck on or come mentor. RSVP with a :hammer: reaction.`,
      status: "AWAITING_APPROVAL",
    },
  });

  await db.draft.create({
    data: {
      workspaceId: workspace.id,
      eventId: event.id,
      channel: "EMAIL",
      subject: "Partner spotlight: Hack Club Build Night",
      body: `Hi Sam,

We're hosting our monthly Repo Rescue build night this Wednesday and would love to mention the Makerspace as our host. Could you confirm the AV setup is available?

Thanks,
Alex`,
      status: "DRAFT",
    },
  });

  const metric = await db.metric.create({
    data: {
      workspaceId: workspace.id,
      eventId: event.id,
      name: "attendance",
      value: 24,
      unit: "people",
      notes: "Last month's build night headcount",
    },
  });

  await db.followUp.create({
    data: {
      eventId: event.id,
      metricId: metric.id,
      title: "Survey attendees on onboarding docs",
      notes: "Send Google Form link in Slack after demos",
      dueAt: eventEnd,
    },
  });

  console.log("Seed complete:");
  console.log(`  Workspace: ${workspace.name} (${workspace.id})`);
  console.log(`  Event: ${event.title} (${event.id})`);
  console.log(`  Starts: ${eventStart.toISOString()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
