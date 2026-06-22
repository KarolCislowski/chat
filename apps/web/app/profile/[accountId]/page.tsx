"use client";

import { useParams } from "next/navigation";
import { ProfilePreviewPage } from "../../../components/profile/application/profile-preview-page";

export default function Page() {
  const params = useParams<{ accountId: string }>();

  return <ProfilePreviewPage accountId={params.accountId} />;
}
