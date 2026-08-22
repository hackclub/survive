class AddNormalizedRepoUrlToProjects < ActiveRecord::Migration[8.1]
  def up
    add_column :projects, :normalized_repo_url, :string
    add_index :projects, :normalized_repo_url

    Project.reset_column_information
    Project.where.not(repo_link: [ nil, "" ]).find_each do |project|
      project.update_column(:normalized_repo_url, RepoUrl.normalize(project.repo_link))
    end
  end

  def down
    remove_index :projects, :normalized_repo_url
    remove_column :projects, :normalized_repo_url
  end
end
