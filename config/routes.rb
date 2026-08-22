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

  get "dashboard" => "dashboard#index", as: :dashboard
  resources :projects, only: %i[new create show update] do
    member do
      post "hackatime_projects/:hackatime_project_id/link" => "projects#link_hackatime_project", as: :link_hackatime_project
      post "hackatime_projects/:hackatime_project_id/unlink" => "projects#unlink_hackatime_project", as: :unlink_hackatime_project
    end
  end

  namespace :admin do
    get "review" => "review#index", as: :review
    get "review/next" => "review#next_project", as: :next_review
    get "review/mystats" => "review#mystats", as: :review_mystats
    get "review/:id" => "review#show", as: :review_project
    post "review/:id/approve" => "review#approve", as: :approve_review
    post "review/:id/reject" => "review#reject", as: :reject_review
    post "review/:id/return" => "review#return_to_maker", as: :return_review
    post "review/:id/skip" => "review#skip", as: :skip_review
    delete "review/:id/claim" => "review#unclaim", as: :unclaim_review
  end

  # Defines the root path route ("/")
  root "landing#index"
end
