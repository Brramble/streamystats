import { Item, Server } from "@/lib/db";
import Image from "next/image";
import { useMemo } from "react";

export default function MediaImage({
  item,
  server,
  className = "",
  size = "large",
}: {
  item: Item;
  server: Server;
  className?: string;
  size?: "default" | "large";
}) {
  // Compute image URLs
  const verticalUrl = useMemo(() => {
    if (!item.jellyfin_id) return null;
    if (item.primary_image_tag) {
      return `${server.url}/Items/${item.jellyfin_id}/Images/Primary?fillHeight=600&fillWidth=400&quality=96&tag=${item.primary_image_tag}`;
    }
    return null;
  }, [item, server]);

  const horizontalUrl = useMemo(() => {
    if (!item.jellyfin_id) return null;
    if (item.backdrop_image_tags && item.backdrop_image_tags.length > 0) {
      return `${server.url}/Items/${item.jellyfin_id}/Images/Backdrop?fillHeight=400&fillWidth=800&quality=96&tag=${item.backdrop_image_tags[0]}`;
    }
    if (item.primary_image_thumb_tag) {
      return `${server.url}/Items/${item.jellyfin_id}/Images/Thumb?fillHeight=400&fillWidth=800&quality=96&tag=${item.primary_image_thumb_tag}`;
    }
    return null;
  }, [item, server]);

  // Decide which to show based on type and availability
  const showBoth = verticalUrl && horizontalUrl;
  const isMovie = item.type === "Movie";
  const isEpisode = item.type === "Episode";

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      {/* Main image: always show vertical if it exists, else horizontal */}
      {verticalUrl ? (
        <div className="relative aspect-[2/3] max-w-[120px] w-full mb-2 overflow-hidden rounded-md bg-muted">
          <Image src={verticalUrl} alt={item.name || "Poster"} fill style={{ objectFit: "cover" }} sizes="120px" />
        </div>
      ) : horizontalUrl ? (
        <div className="relative aspect-video max-w-[180px] w-full mb-2 overflow-hidden rounded-md bg-muted">
          <Image src={horizontalUrl} alt={item.name || "Backdrop"} fill style={{ objectFit: "cover" }} sizes="180px" />
        </div>
      ) : (
        <div className="w-full h-20 flex items-center justify-center text-xs text-muted-foreground">No image</div>
      )}
      {/* If both exist, show the secondary image smaller below */}
      {verticalUrl && horizontalUrl && (
        <div className="relative aspect-video max-w-[100px] w-full mt-1 overflow-hidden rounded bg-muted">
          <Image src={horizontalUrl} alt={item.name || "Backdrop"} fill style={{ objectFit: "cover" }} sizes="100px" />
        </div>
      )}
    </div>
  );
} 