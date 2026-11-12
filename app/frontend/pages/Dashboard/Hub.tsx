import { Hub, type HubCamp } from "../../components/Hub"

export default function DashboardHub({ camp }: { camp: HubCamp }) {
  return <Hub camp={camp} />
}
