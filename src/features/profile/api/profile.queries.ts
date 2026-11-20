import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { getMyProfile } from "../api/profile.api";

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: getMyProfile,
    enabled,
  });
}
