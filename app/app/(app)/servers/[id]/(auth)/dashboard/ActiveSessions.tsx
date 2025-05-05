"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActiveSession, Server } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Clock, Film, MonitorPlay, Pause, Play, Tv, User, Cog, Zap, Monitor, Smartphone, Volume2, Video, Globe2 } from "lucide-react";
import LoadingSessions from "./LoadingSessions";
import MediaImage from "./MediaImage";
import JellyfinAvatar from "@/components/JellyfinAvatar";
import Link from "next/link";

// Utility: show seconds ago if < 60s, else use formatDistanceToNow
function formatDistanceWithSeconds(date: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds
  if (diff < 1) {
    return "just now";
  }
  if (diff < 60) {
    return `${diff} second${diff === 1 ? "" : "s"} ago`;
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

export function ActiveSessions({ server }: { server: Server }) {
  const { data, isPending } = useQuery({
    queryKey: ["activeSessions", server.id],
    queryFn: async () =>
      (await fetch(`/api/Sessions?serverId=${server.id}`).then((res) =>
        res.json()
      )) as ActiveSession[],
    refetchInterval: 500,
  });

  const sortedSessions =
    data?.sort((a, b) => {
      return b.position_ticks - a.position_ticks;
    }) || [];

  if (isPending) {
    return <LoadingSessions />;
  }

  if (!data || data?.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorPlay className="h-5 w-5" />
            <span>Active Sessions</span>
          </CardTitle>
          <CardDescription>
            Currently playing content on your server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No active sessions at the moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 p-0 m-0">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <MonitorPlay className="h-5 w-5" />
          <span>Active Sessions</span>
          <Badge variant="outline" className="ml-2">
            {data.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Currently playing content on your server
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="px-2 md:px-4">
          <div
            className={
              sortedSessions.length === 1
                ? "grid grid-cols-1 gap-4 w-full max-w-2xl mx-auto"
                : sortedSessions.length === 2
                ? "grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto"
                : sortedSessions.length === 3
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl mx-auto"
            }
          >
            {sortedSessions.map((session) => (
              <div key={session.session_key} className="border rounded-lg p-4 w-full flex flex-col items-center bg-background/90 shadow-lg max-w-sm mx-auto">
                {/* Poster at the top, larger */}
                <div className="mb-3 flex items-center justify-center">
                  <MediaImage item={session.item} server={server} size="large" className="max-w-[140px] max-h-[140px] md:max-w-[180px] md:max-h-[180px] w-full h-auto" />
                </div>
                {/* Title row: play/pause icon, then title */}
                <div className="flex items-center gap-2 mb-0 w-full justify-center">
                  {session.is_paused ? (
                    <Pause className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Play className="h-5 w-5 text-green-500" />
                  )}
                  <h3 className="font-bold text-lg text-center break-words whitespace-normal w-full">{session.item?.name}</h3>
                </div>
                {/* Badge and episode/movie info under title */}
                <div className="flex flex-col items-center w-full mb-1">
                  <div className="flex gap-2 items-center justify-center">
                    <MediaTypeBadge type={session.item?.type} />
                  </div>
                  {session.item.series_name && (
                    <div className="text-sm text-muted-foreground text-center w-full">
                      {session.item.series_name}
                      {session.item.parent_index_number && session.item.index_number && (
                        <span> - S{session.item.parent_index_number}:E{session.item.index_number}</span>
                      )}
                    </div>
                  )}
                </div>
                {/* Time and progress */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 w-full justify-center">
                  <Clock className="h-4 w-4" />
                  {session.formatted_position} / {session.formatted_runtime}
                </div>
                <div className="w-full flex items-center gap-2 mb-1">
                  <Progress value={session.progress_percent} className="h-2 flex-1" />
                  <span className="text-xs font-medium min-w-[2.5rem] text-right">{Math.round(session.progress_percent)}%</span>
                </div>
                {/* User info */}
                <div className="flex items-center gap-2 mb-1 w-full justify-center">
                  {session.user ? (
                    <Link href={`/servers/${server.id}/users/${session.user.jellyfin_id}`} className="flex items-center gap-2 group">
                      <JellyfinAvatar user={session.user} serverUrl={server.url} className="h-7 w-7 rounded-lg transition-transform duration-200 group-hover:scale-110" />
                      <span className="text-base font-medium transition-colors duration-200 group-hover:text-primary">{session.user.name}</span>
                    </Link>
                  ) : (
                    <span className="text-base font-medium flex items-center gap-2">
                      <User className="h-7 w-7 text-muted-foreground" />
                      Unknown User
                    </span>
                  )}
                </div>
                {/* Technical details stacked */}
                <div className="flex flex-col gap-1 w-full text-sm text-muted-foreground mb-1">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-blue-400" />
                    <span className="font-medium">Device:</span> {session.device_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-400" />
                    <span className="font-medium">Client:</span> {session.client}
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className={"h-4 w-4 " + (session.transcoding_info ? (session.transcoding_info.is_video_direct ? 'text-green-500' : 'text-amber-500') : 'text-gray-400')} />
                    <span className="font-medium">Video:</span> {session.transcoding_info ? (session.transcoding_info.is_video_direct ? 'Direct Play' : 'Transcode') : session.play_method || 'Unknown'}
                    {session.transcoding_info?.video_codec && (
                      <span className="ml-1">({session.transcoding_info.video_codec.toUpperCase()}{session.transcoding_info.bitrate ? ` - ${(session.transcoding_info.bitrate / 1000000).toFixed(1)} Mbps` : ""})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-indigo-400" />
                    <span className="font-medium">Audio:</span> {session.transcoding_info?.audio_codec || 'Unknown'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-cyan-400" />
                    <span className="font-medium">IP:</span> {session.ip_address || 'N/A'}
                  </div>
                </div>
                {/* Last activity */}
                {session.last_activity_date && (
                  <div className="text-xs text-muted-foreground w-full mt-1 text-center">
                    Last activity: {formatDistanceWithSeconds(new Date(session.last_activity_date))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MediaTypeBadge({ type }: { type?: string }) {
  if (!type) return null;

  const icon = type === "Movie" ? Film : Tv;
  const Icon = icon;

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {type}
    </Badge>
  );
}

function PlaybackMethodBadge({ session }: { session: ActiveSession }) {
  const isTranscoding = session.transcoding_info && !session.transcoding_info.is_video_direct;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {isTranscoding ? (
              <Cog className="h-4 w-4 text-amber-500" />
            ) : (
              <Zap className="h-4 w-4 text-green-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {isTranscoding
                ? `Transcoding (${session.transcoding_info?.video_codec || 'unknown'})`
                : 'Direct Play'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isTranscoding
            ? `Transcoding video to ${session.transcoding_info?.video_codec}`
            : 'Direct playing without transcoding'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
