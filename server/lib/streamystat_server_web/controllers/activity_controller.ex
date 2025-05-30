defmodule StreamystatServerWeb.ActivityController do
  use StreamystatServerWeb, :controller
  alias StreamystatServer.Activities.Activities
  alias StreamystatServer.Servers.Servers

  def index(conn, %{"server_id" => server_id} = params) do
    case Servers.get_server(server_id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> put_view(StreamystatServerWeb.ErrorJSON)
        |> render("404.json", %{})

      server ->
        page = params["page"] || "1"
        per_page = params["per_page"] || "20"

        {page, _} = Integer.parse(page)
        {per_page, _} = Integer.parse(per_page)

        %{
          entries: activities,
          page_number: page_number,
          page_size: page_size,
          total_entries: total_entries,
          total_pages: total_pages
        } = Activities.list_activities(server, page: page, per_page: per_page)

        render(conn, :index,
          activities: activities,
          page: page_number,
          per_page: page_size,
          total_items: total_entries,
          total_pages: total_pages
        )
    end
  end
end
