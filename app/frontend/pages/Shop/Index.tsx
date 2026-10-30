import { useMemo, useState } from "react"
import { Head, Link } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"
import { Empty } from "../../components/Empty"
import { SkeletonShopList } from "../../components/Skeleton"
import { useVisiting } from "../../lib/useVisiting"
import { formatMinutes } from "../../lib/format"

type Item = {
  id: number
  name: string
  description: string | null
  kind: string
  imageUrl: string | null
  coinCost: number
  stock: number | null
  onePerPerson: boolean
  minApprovedHours: number | null
  unavailableReason: string | null
  shortBy: number
  featured: boolean
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "physical", label: "Physical" },
  { value: "digital", label: "Digital" },
  { value: "grant", label: "Grants" },
] as const

type Filter = (typeof FILTERS)[number]["value"]

export default function Index({ items, balance, trueBalance, frozen, approvedMinutes }: {
  items: Item[]
  balance: number
  trueBalance: number
  frozen: boolean
  approvedMinutes: number
}) {
  const visiting = useVisiting()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesFilter = filter === "all" || item.kind === filter
      const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [items, search, filter])

  const featuredItems = filteredItems.filter((item) => item.featured)
  const regularItems = filteredItems.filter((item) => !item.featured)

  function Card({ item, featured = false }: { item: Item; featured?: boolean }) {
    const locked = item.unavailableReason !== null
    return (
      <Link key={item.id} href={`/shop/items/${item.id}`} className={`shop-card${locked ? " shop-card--locked" : ""}${featured ? " shop-card--featured" : ""}`}>
        {item.imageUrl ? <img className="shop-card__image" src={item.imageUrl} alt="" loading="lazy" decoding="async" /> : <div className="shop-card__image shop-card__image--placeholder" />}
        <div className="shop-card__body">
          <span className="shop-card__name">{item.name}</span>
          {item.description && <p className="shop-card__description">{item.description}</p>}
          {item.onePerPerson && <span className="shop-card__note">One per person</span>}
          {item.stock !== null && <span className="shop-card__note">{item.stock} left</span>}
          {item.shortBy > 0 && <span className="shop-card__short">{item.shortBy} more wood</span>}
          {locked && item.shortBy === 0 && <span className="shop-card__short shop-card__short--out">{item.unavailableReason}</span>}
          <div className="shop-card__price">
            <span className="coin" aria-hidden="true" />
            <b>{item.coinCost}</b>
            <span className="btn btn--primary btn--sm" aria-disabled={locked ? "true" : undefined} style={locked ? { opacity: 0.45 } : undefined}>Order</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      <Head title="Shop - Survive" />
      <AppShell eyebrow="Shop" title={frozen ? "Spending is paused" : `${balance} wood to spend`} tone={frozen ? "returned" : undefined} wide lede={frozen ? `Your account is suspended, so your ${trueBalance} wood cannot be spent right now. Open orders are on hold, not cancelled.` : `${formatMinutes(approvedMinutes)} approved so far.`}>
        {!visiting && items.length > 0 && <div className="shop-toolbar">
          <label className="shop-search"><span className="sr-only">Search the shop</span><input className="field__input" type="search" placeholder="Search the shop..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="shop-filters" role="group" aria-label="Filter shop items">
            {FILTERS.map((option) => <button key={option.value} type="button" className={`btn btn--sm ${filter === option.value ? "btn--primary" : "btn--ghost"}`} onClick={() => setFilter(option.value)} aria-pressed={filter === option.value}>{option.label}</button>)}
          </div>
        </div>}
        {visiting ? <SkeletonShopList rows={items.length || 8} /> : items.length === 0 ? <Empty title="The shelves are bare" text="Nothing in the shop yet. Check back." idle /> : filteredItems.length === 0 ? <Empty title="Nothing matches" text="Try a different search or filter." idle /> : <div className="shop-content" style={frozen ? { opacity: 0.45 } : undefined}>
          {featuredItems.length > 0 && <div className="shop-featured"><div className="shop-featured__grid">{featuredItems.map((item) => <Card key={item.id} item={item} featured />)}</div></div>}
          {regularItems.length > 0 && <div className="shop-grid">{regularItems.map((item) => <Card key={item.id} item={item} />)}</div>}
        </div>}
      </AppShell>
    </>
  )
}
