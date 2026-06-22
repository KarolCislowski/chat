"use client";

import { useParams } from "next/navigation";
import { GuildDetailsPage } from "../../../components/guild/guild-details-page";

export default function Page() {
  const params = useParams<{ guildId: string }>();

  return <GuildDetailsPage guildId={params.guildId} />;
}
