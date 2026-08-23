import { useState } from "react"
import { Head, Link, router, useForm } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status } from "../../../components/Status"

type Region = { id: number; region: string; coinCost: number | null; enabled: boolean }

type Item = {
  id: number
  name: string
  description: string | null
  kind: string
  coinCost: number
  enabled: boolean
  stock: number | null
  onePerPerson: boolean
  maxQuantity: number | null
  minApprovedHours: number | null
  imageUrl: string | null
  regions: Region[]
}

type RegionDraft = { id?: number; region: string; coinCost: string; enabled: boolean; _destroy?: boolean }

export default function Form({ item, kinds }: { item: Item | null; kinds: string[] }) {
  const form = useForm({
    name: item?.name ?? "",
    description: item?.description ?? "",
    kind: item?.kind ?? kinds[0],
    coin_cost: item?.coinCost ?? 0,
    enabled: item?.enabled ?? true,
    max_quantity: item?.maxQuantity ?? "",
    one_per_person: item?.onePerPerson ?? false,
    stock: item?.stock ?? "",
    min_approved_hours: item?.minApprovedHours ?? "",
  })

  const [image, setImage] = useState<File | null>(null)
  const [regions, setRegions] = useState<RegionDraft[]>(
    (item?.regions ?? []).map((r) => ({
      id: r.id,
      region: r.region,
      coinCost: r.coinCost === null ? "" : String(r.coinCost),
      enabled: r.enabled,
    })),
  )

  function save() {
    const payload: Record<string, unknown> = { ...form.data }
    if (image) payload.image = image
    if (item) {
      payload.shop_item_regions_attributes = regions.map((r) => ({
        id: r.id,
        region: r.region,
        coin_cost: r.coinCost === "" ? null : Number(r.coinCost),
        enabled: r.enabled,
        _destroy: r._destroy ?? false,
      }))
    }

    const url = item ? `/admin/shop_items/${item.id}` : "/admin/shop_items"
    router.post(url, { ...payload, ...(item ? { _method: "patch" } : {}) }, { forceFormData: true })
  }

  return (
    <>
      <Head title={`${item ? "Edit" : "New"} shop item - Survive`} />

      <AdminSidebarLayout
        eyebrow="Shop items"
        title={item ? item.name : "New item"}
        actions={
          <Link className="nav__ghost" href="/admin/shop_items">
            Back
          </Link>
        }
      >
        <div className="review__grid">
          <div className="review__main">
            <section className="review__card">
              <div className="field-group">
                <div className="field">
                  <label className="field__label" htmlFor="name">Name</label>
                  <input id="name" className="field__input" value={form.data.name}
                    onChange={(e) => form.setData("name", e.target.value)} />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="description">Description</label>
                  <textarea id="description" className="field__input field__input--textarea" rows={3}
                    value={form.data.description}
                    onChange={(e) => form.setData("description", e.target.value)} />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="image">Image</label>
                  {item?.imageUrl && <img className="shop-cell__preview" src={item.imageUrl} alt="" />}
                  <input id="image" className="field__input" type="file" accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
                </div>

                <div className="form-row">
                  <div className="field">
                    <label className="field__label" htmlFor="kind">Kind</label>
                    <select id="kind" className="field__input" value={form.data.kind}
                      onChange={(e) => form.setData("kind", e.target.value)}>
                      {kinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="coin_cost">Coins</label>
                    <input id="coin_cost" className="field__input" type="number" min={1}
                      value={form.data.coin_cost}
                      onChange={(e) => form.setData("coin_cost", Number(e.target.value))} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label className="field__label" htmlFor="stock">Stock, blank for unlimited</label>
                    <input id="stock" className="field__input" type="number" min={0} value={form.data.stock}
                      onChange={(e) => form.setData("stock", e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="max">Max per order</label>
                    <input id="max" className="field__input" type="number" min={1} value={form.data.max_quantity}
                      onChange={(e) => form.setData("max_quantity", e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="unlock">Unlocks at hours</label>
                    <input id="unlock" className="field__input" type="number" min={0}
                      value={form.data.min_approved_hours}
                      onChange={(e) => form.setData("min_approved_hours", e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <label className="checkbox">
                    <input type="checkbox" checked={form.data.enabled}
                      onChange={(e) => form.setData("enabled", e.target.checked)} />
                    Enabled
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" checked={form.data.one_per_person}
                      onChange={(e) => form.setData("one_per_person", e.target.checked)} />
                    One per person, ever
                  </label>
                </div>

                <div className="project-form__actions">
                  <button className="btn btn--primary" type="button" onClick={save}>
                    {item ? "Save" : "Create"}
                  </button>
                  {item && (
                    <button className="btn btn--ghost" type="button"
                      onClick={() => router.delete(`/admin/shop_items/${item.id}`)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="review__sidebar">
            <div className="review__card">
              <h2 className="review__card-title u-h3">Regions</h2>
              {!item ? (
                <p className="u-sm u-faint">Save the item first, then add regional prices.</p>
              ) : (
                <>
                  {regions.filter((r) => !r._destroy).map((row, index) => (
                    <div key={row.id ?? `new-${index}`} className="region-row">
                      <input className="field__input" placeholder="country" value={row.region}
                        onChange={(e) => setRegions(regions.map((r) => (r === row ? { ...r, region: e.target.value } : r)))} />
                      <input className="field__input" type="number" placeholder="coins" value={row.coinCost}
                        onChange={(e) => setRegions(regions.map((r) => (r === row ? { ...r, coinCost: e.target.value } : r)))} />
                      <label className="checkbox">
                        <input type="checkbox" checked={row.enabled}
                          onChange={(e) => setRegions(regions.map((r) => (r === row ? { ...r, enabled: e.target.checked } : r)))} />
                        on
                      </label>
                      <button className="btn btn--quiet btn--sm" type="button"
                        onClick={() => setRegions(regions.map((r) => (r === row ? { ...r, _destroy: true } : r)))}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button className="btn btn--ghost btn--sm" type="button"
                    onClick={() => setRegions([...regions, { region: "", coinCost: "", enabled: true }])}>
                    Add region
                  </button>
                </>
              )}
            </div>

            {item && (
              <div className="review__card">
                <h2 className="review__card-title u-label u-faint">Status</h2>
                {item.enabled ? <Status tone="ok">Enabled</Status> : <Status>Disabled</Status>}
              </div>
            )}
          </aside>
        </div>
      </AdminSidebarLayout>
    </>
  )
}
