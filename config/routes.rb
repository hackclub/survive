Rails.application.routes.draw do
  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  get "signin" => "auth#show", as: :signin
  get "auth/hack_club/callback" => "auth#create", as: :hack_club_callback
  get "auth/failure" => "auth#failure", as: :auth_failure
  delete "auth/signout" => "auth#destroy", as: :signout
  get "auth/hackatime/callback" => "hackatime_identities#create", as: :hackatime_callback

  post "webhooks/ari" => "ari_webhooks#create", as: :ari_webhook

  namespace :admin do
    root to: "overview#index"

    resources :audit_logs, only: :index

    resources :shop_items

    resources :orders, only: :index do
      member do
        post "decide"
        post "refund"
      end
    end

    resources :fulfillment, only: :index do
      member { post "fulfill" }
    end

    resources :coins, only: %i[index show] do
      member { post "adjust" }
    end

    resources :users, only: %i[index update] do
      member do
        post "ban"
        delete "ban" => "users#unban"
      end
    end

    resources :reviews, only: :index do
      member { post "withdraw" }
    end

    resources :final_reviews, only: %i[index show] do
      member do
        post "decide"
        delete "claim" => "final_reviews#unclaim"
      end
    end
  end

  get "dashboard" => "dashboard#index", as: :dashboard
  get "account" => "accounts#show", as: :account
  get "shop" => "shop#index", as: :shop
  get "shop/items/:id" => "shop#show", as: :shop_item
  resources :orders, only: %i[index create]
  resources :projects, only: %i[new create show update] do
    member do
      post "hackatime_projects/:hackatime_project_id/link" => "projects#link_hackatime_project", as: :link_hackatime_project
      post "hackatime_projects/:hackatime_project_id/unlink" => "projects#unlink_hackatime_project", as: :unlink_hackatime_project
    end
  end

  # Defines the root path route ("/")
  root "landing#index"
end
