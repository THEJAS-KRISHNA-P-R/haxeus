import { verifyAdmin } from "@/lib/admin-guard"
import SettingsContent from "./SettingsContent"

export default async function SettingsPage() {
  await verifyAdmin()
  return <SettingsContent />
}

