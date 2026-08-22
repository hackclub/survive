class Admin::ShopItemsController < ApplicationController
  before_action :set_item, only: %i[edit update destroy]

  def index
    authorize ShopItem

    items = ShopItem.includes(:shop_item_regions, image_attachment: :blob).sorted

    render inertia: "Admin/ShopItems/Index", props: {
      items: items.map { |item| row(item) },
      kinds: ShopItem.kinds.keys
    }
  end

  def new
    authorize ShopItem
    render inertia: "Admin/ShopItems/Form", props: { item: nil, kinds: ShopItem.kinds.keys }
  end

  def create
    item = ShopItem.new(item_params)
    authorize item
    attach_image(item)

    if item.save
      audit!("shop_item.created", target: item, metadata: { name: item.name, coin_cost: item.coin_cost })
      redirect_to edit_admin_shop_item_path(item), notice: "Created #{item.name}."
    else
      redirect_to new_admin_shop_item_path, inertia: { errors: item.errors.messages }
    end
  end

  def edit
    authorize @item
    render inertia: "Admin/ShopItems/Form", props: { item: detail(@item), kinds: ShopItem.kinds.keys }
  end

  def update
    authorize @item
    attach_image(@item)

    if @item.update(item_params)
      audit!("shop_item.updated", target: @item, metadata: { name: @item.name, enabled: @item.enabled })
      redirect_to edit_admin_shop_item_path(@item), notice: "Saved."
    else
      redirect_to edit_admin_shop_item_path(@item), inertia: { errors: @item.errors.messages }
    end
  end

  def destroy
    authorize @item
    name = @item.name
    @item.destroy!
    audit!("shop_item.deleted", metadata: { name: name })
    redirect_to admin_shop_items_path, notice: "Deleted #{name}."
  end

  private

  def set_item
    @item = ShopItem.find(params[:id])
  end

  def item_params
    params.permit(
      :name, :description, :kind, :coin_cost, :internal_price_usd,
      :enabled, :max_quantity, :one_per_person, :stock, :min_approved_hours,
      shop_item_regions_attributes: [ :id, :region, :coin_cost, :enabled, :_destroy ]
    )
  end

  def attach_image(item)
    return if params[:image].blank?

    item.image.attach(params[:image])
  end

  def row(item)
    {
      id: item.id,
      name: item.name,
      kind: item.kind,
      coinCost: item.coin_cost,
      internalPriceUsd: item.internal_price_usd&.to_f,
      enabled: item.enabled,
      stock: item.stock,
      onePerPerson: item.one_per_person,
      maxQuantity: item.max_quantity,
      minApprovedHours: item.min_approved_hours,
      imageUrl: item.image_url,
      regions: item.shop_item_regions.map { |region| region_row(region) }
    }
  end

  def detail(item)
    row(item).merge(description: item.description)
  end

  def region_row(region)
    {
      id: region.id,
      region: region.region,
      coinCost: region.coin_cost,
      enabled: region.enabled
    }
  end
end
